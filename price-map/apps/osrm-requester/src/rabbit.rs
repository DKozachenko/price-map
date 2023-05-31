use amiquip::{Connection, Error, Channel, Queue, QueueDeclareOptions, Consumer, ConsumerOptions, Exchange, Publish};
use serde::Serialize;
use std::{error::Error as StdError, cell::RefCell};
use super::logger::Logger;

pub struct Rabbit {
    logger: Logger,
    connection: RefCell<Option<Connection>>,
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

    pub fn init_connection(&mut self) -> Result<(), Error> {
        let connection: Connection = Connection::insecure_open("amqp://admin:admin_rabbit@localhost:5672")?;
        self.connection = RefCell::new(Some(connection));
        let channel: Channel = self.connection.borrow_mut().as_mut().unwrap().open_channel(None)?;
        self.channel = Some(channel);

        Ok(())
    }

    pub fn get_queue_consumer(&self, queue_name: &str) -> Result<Consumer, Error> {
        let queue: Queue = self.channel.as_ref().unwrap().queue_declare(queue_name, QueueDeclareOptions {
            durable: true,
            ..QueueDeclareOptions::default()
        })?;


        queue.consume(ConsumerOptions::default())
    }

    pub fn send_message<T>(&self, queue_name: &str, message: T) -> Result<(), Box<dyn StdError>>
        where T: Serialize {
        let message_str: String = serde_json::to_string(&message)?;

        let exchange: Exchange = Exchange::direct(self.channel.as_ref().unwrap());
        let body: &[u8] = message_str.as_bytes();
        exchange.publish(Publish::new(body, queue_name))?;
        self.logger.log(format!("Send message to {}, content length: {}", queue_name, body.len()).as_str(), "main");

        Ok(())
    }

    pub fn close_connection(&self) -> Result<(), Error> {
        self.connection.borrow_mut().take().unwrap().close()
    }
}
