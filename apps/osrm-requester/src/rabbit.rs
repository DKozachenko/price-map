use amiquip::{Connection, Error, Channel, Queue, QueueDeclareOptions, Consumer, ConsumerOptions, Exchange, Publish};
use serde::Serialize;
use std::cell::RefCell;
use super::logger::Logger;
use anyhow::Result;

/// Клиент для взаимодействия с RabbitMQ
#[derive(Default)]
pub struct Rabbit {
    /// **Logger** | *логгер*
    logger: Logger,
    /// **RefCell<Option<Connection>>** | *текущее подключение*
    connection: RefCell<Option<Connection>>,
    /// Option<Channel> | *канал*
    channel: Option<Channel>
}

impl Rabbit {
    pub fn new() -> Self {
        Rabbit {
            logger: Logger::new(),
            connection: RefCell::new(None),
            channel: None
        }
    }

    /// Инициализация подлючения
    /// #### args:
    /// #### return:
    /// - **Result<(), Error>** | *результат подключения*
    pub fn init_connection(&mut self) -> Result<(), Error> {
        let connection: Connection = Connection::insecure_open("amqp://admin:admin_rabbit@localhost:5672")?;
        self.connection = RefCell::new(Some(connection));
        let channel: Channel = self.connection.borrow_mut().as_mut().unwrap().open_channel(None)?;
        self.channel = Some(channel);

        Ok(())
    }

    /// Получение потребителя очереди (по сути подписка на очередь)
    /// #### args:
    /// - &str | queue_name | *название очереди*
    /// #### return:
    /// - **Result<Consumer, Error>** | *результат получения (объект потребителя или ошибка)*
    pub fn get_queue_consumer(&self, queue_name: &str) -> Result<Consumer, Error> {
        let queue: Queue = self.channel.as_ref().unwrap().queue_declare(queue_name, QueueDeclareOptions {
            durable: true,
            ..QueueDeclareOptions::default()
        })?;


        queue.consume(ConsumerOptions::default())
    }

    /// Отправка сообщения
    /// #### args:
    /// - &str | queue_name | *название очереди*
    /// - T | message | *сообщение (произвольные данные)*
    /// #### return:
    /// - **Result<(), Box<dyn StdError>>** | *результат отправки*
    pub fn send_message<T>(&self, queue_name: &str, message: T) -> Result<()>
        where T: Serialize {
        let message_str: String = serde_json::to_string(&message)?;

        let exchange: Exchange = Exchange::direct(self.channel.as_ref().unwrap());
        let body: &[u8] = message_str.as_bytes();
        exchange.publish(Publish::new(body, queue_name))?;
        self.logger.log(format!("Send message to {}, content length: {}", queue_name, body.len()).as_str(), "rabbit");

        Ok(())
    }

    /// Закрытие соединения
    /// #### args:
    /// #### return:
    /// - **Result<(), Error>** | *результат закрытия*
    pub fn close_connection(&self) -> Result<(), Error> {
        self.connection.borrow_mut().take().unwrap().close()
    }
}
