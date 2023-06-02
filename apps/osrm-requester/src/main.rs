mod logger;
mod rabbit;
mod osrm;
mod coordinate;
mod config;

use std::{process, borrow};
use amiquip::{ConsumerMessage, Consumer, Delivery};
use geo_types::LineString;
use reqwest::blocking::Response;
use polyline::{self, decode_polyline};
use chrono::prelude::*;
use serde::{Serialize, Deserialize};
use anyhow::anyhow;

use logger::Logger;
use rabbit::Rabbit;
use config::{Config, get_config};
use coordinate::{Coordinate, get_coordinates_str, get_coordinates};
use osrm::{OsrmData, OsrmMessageData};

/// Сообщение (интерфейс обмена данными между сервисами)
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Message<T> {
    /// Произвольные данные
    pub data: T,
    /// Описание
    pub description: String,
    /// Время отправки
    pub send_time: String
}

fn main() -> anyhow::Result<()> {
    let logger: Logger = Logger::new();
    let mut rabbit: Rabbit = Rabbit::new();
    logger.log("Application start", "main");

    let config: Config = get_config().unwrap_or_else(|err| {
        shutdown(&logger, format!("Error while getting config file: {}", err));
    });

    rabbit.init_connection().unwrap_or_else(|err| {
        shutdown(&logger, format!("Error while getting connection: {}", err));
    });

    let consumer: Consumer = rabbit.get_queue_consumer(&config.request_queue).unwrap_or_else(|err| {
        shutdown(&logger, format!("Error while getting consumer from queue: {}, {}", &config.request_queue, err));
    });

    for (_i, message) in consumer.receiver().iter().enumerate() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                match process_message(&logger, &consumer, &config.request_queue, delivery) {
                    Ok(data) => send_success_message(&rabbit, &config.response_queue, data)?,
                    Err(err) => {
                        logger.error(err.to_string().as_str(), "main");
                        send_error_message(&rabbit, &config.response_queue)?
                    },
                }
            }
            other => {
                logger.log(format!("Consumer ended: {:?}", other).as_str(), "main");
                break;
            }
        }
    }

    rabbit.close_connection().unwrap_or_else(|err| {
        shutdown(&logger, format!("Error while closing connection: {}", err));
    });

    Ok(())
}

/// Завершение приложения
fn shutdown(logger: &Logger, error_message: String) -> ! {
    logger.error(error_message.as_str(), "shutdown");
    logger.error("Application shut down", "shutdown");
    process::exit(-1)
}

/// Обработка сообщения из очереди
fn process_message(logger: &Logger, consumer: &Consumer, queue_name: &str, delivery: Delivery) -> anyhow::Result<OsrmMessageData> {
    logger.log(format!("Message from {}, content length: {}", queue_name, delivery.body.len()).as_str(), "process_message");
    let body: borrow::Cow<str> = String::from_utf8_lossy(&delivery.body);
    // Десериализация JSON
    let message: Message<Vec<Coordinate>> = serde_json::from_str(&body)
        .map_err(|err| anyhow!("Error while deserializing message {body}, error: {err}"))?;

    // Доставание из очереди сообщения
    consumer.ack(delivery)
        .map_err(|err| anyhow!("Error while acking message {err}"))?;

    let coordinates_str: String = get_coordinates_str(message.data);
    let url: String = format!("http://router.project-osrm.org/route/v1/driving/{}?overview=full&steps=true", coordinates_str);

    logger.log(format!("Send http request to {}", url).as_str(), "process_message");
    // Запрос в OSRM
    let response: Response = reqwest::blocking::get(&url)
        .map_err(|err| anyhow!("Error while sending request: {url}, error {err}"))?;

    // Десериализация ответа
    let osrm_data: OsrmData = response.json::<OsrmData>()
        .map_err(|err| anyhow!("Error while deserializing data from response: {err}"))?;

    // Декодирование полилайна
    let decoded_line_string: LineString = decode_polyline(&osrm_data.routes[0].geometry, 5)
        .map_err(|err| anyhow!(format!("Error while decoding polyline: {}, error {}", &osrm_data.routes[0].geometry, err)))?;

    let coordinates: Vec<[f64; 2]> = get_coordinates(decoded_line_string);
    Ok(OsrmMessageData {
        coordinates,
        legs: osrm_data.routes[0].legs.clone()
    })
}

/// Отправка сообщения с ошибкой
fn send_error_message(rabbit: &Rabbit, queue_name: &str) -> anyhow::Result<()> {
    let message: Message<Option<OsrmMessageData>> = Message {
        data: None,
        description: String::from("Ошибка при обработке сообщения"),
        send_time: Local::now().to_string()
    };

    rabbit.send_message(queue_name, message)
}

/// Отправка сообщения с построенным маршрутом
fn send_success_message(rabbit: &Rabbit, queue_name: &str, data: OsrmMessageData) -> anyhow::Result<()> {
    let message: Message<OsrmMessageData> = Message {
        data,
        description: String::from("Успешное построение маршрута"),
        send_time: Local::now().to_string()
    };

    rabbit.send_message(queue_name, message)
}
