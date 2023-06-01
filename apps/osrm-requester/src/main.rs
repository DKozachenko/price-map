pub mod logger;
pub mod rabbit;

use std::{process, result::Result, error::Error as StdError, borrow};
use amiquip::{ConsumerMessage, Consumer};
use geo_types::{LineString};
use reqwest::blocking::Response;
use polyline::{self, decode_polyline};
use chrono::prelude::*;
use logger::Logger;
use rabbit::Rabbit;
use osrm_requester::{Config, get_config, Message, Coordinates, get_coordinates_str, OsrmData, OsrmMessageData, get_coordinates};

fn main() -> Result<(), Box<dyn StdError>> {
    let logger: Logger = Logger::new();
    let mut rabbit: Rabbit = Rabbit::new();
    logger.log("Application start", "main");

    let config: Config = get_config().unwrap_or_else(|err| {
        logger.error(format!("Error while getting config file: {}", err).as_str(), "main");
        process::exit(-1);
    });

    rabbit.init_connection().unwrap_or_else(|err| {
        logger.error(format!("Error while getting connection: {}", err).as_str(), "main");
        process::exit(-1);
    });

    let consumer: Consumer = rabbit.get_queue_consumer(&config.request_queue).unwrap_or_else(|err| {
        logger.error(format!("Error while getting consumer from queue: {}, {}", &config.request_queue, err).as_str(), "main");
        process::exit(-1);
    });

    for (_i, message) in consumer.receiver().iter().enumerate() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                logger.log(format!("Message from {}, content length: {}", &config.request_queue, delivery.body.len()).as_str(), "main");
                let body: borrow::Cow<str> = String::from_utf8_lossy(&delivery.body);
                // Десериализация JSON
                let message: Message<Vec<Coordinates>> = match serde_json::from_str(&body) {
                    Ok(message) => message,
                    Err(err) => {
                        logger.error(format!("Error while deserializing message {}, error: {}", body, err).as_str(), "main");
                        send_error_message(&rabbit, &config.response_queue, "Невалидный JSON")?;
                        break;
                    },
                };

                // Доставание из очереди сообщения
                match consumer.ack(delivery) {
                    Ok(_) => (),
                    Err(err) => {
                        logger.error(format!("Error while acking message: {}", err).as_str(), "main");
                        send_error_message(&rabbit, &config.response_queue, "Не удалось сделать запрос для получения данных")?;
                        break;
                    },
                }

                let coordinates_str: String = get_coordinates_str(message.data);
                let url: String = format!("http://router.project-osrm.org/route/v1/driving/{}?overview=full&steps=true", coordinates_str);

                logger.log(format!("Send http request to {}", url).as_str(), "main");
                // Запрос в OSRM
                let response: Response = match reqwest::blocking::get(&url) {
                    Ok(resp) => resp,
                    Err(err) => {
                        logger.error(format!("Error while sending request: {}, error {}", url, err).as_str(), "main");
                        send_error_message(&rabbit, &config.response_queue, "Не удалось сделать запрос для получения данных")?;
                        break;
                    },
                };

                // Десериализация ответа
                let osrm_data: OsrmData = match response.json::<OsrmData>() {
                    Ok(data) => data,
                    Err(err) => {
                        logger.error(format!("Error while deserializing data from response: {}", err).as_str(), "main");
                        send_error_message(&rabbit, &config.response_queue, "Не удалось получить данные")?;
                        break;
                    },
                };

                // Декодирование полилайна
                let decoded_line_string: LineString = match decode_polyline(&osrm_data.routes[0].geometry, 5) {
                    Ok(line_string) => line_string,
                    Err(err) => {
                        logger.error(format!("Error while decoding polyline: {}, error {}", &osrm_data.routes[0].geometry, err).as_str(), "main");
                        send_error_message(&rabbit, &config.response_queue, "Не удалось получить данные")?;
                        break;
                    },
                };

                let coordinates: Vec<[f64; 2]> = get_coordinates(decoded_line_string);
                let message: Message<OsrmMessageData> = Message {
                    data: OsrmMessageData {
                        coordinates,
                        legs: &osrm_data.routes[0].legs
                    },
                    description: String::from("Успешное построение маршрута"),
                    send_time: Local::now().to_string()
                };

                rabbit.send_message(&config.response_queue, message)?;
            }
            other => {
                logger.log(format!("Consumer ended: {:?}", other).as_str(), "main");
                break;
            }
        }
    }

    rabbit.close_connection().unwrap_or_else(|err| {
        logger.error(format!("Error while closing connection: {}", err).as_str(), "main");
        process::exit(-1);
    });

    Ok(())
}

/// Отправка сообщения с ошибкой
/// #### args:
/// - rabbit | **&Rabbit** | *рэббит*
/// - queue_name | **&str** | *название очереди*
/// - message | **&str** | *сообщение*
/// #### return:
/// - **Result<(), Box<dyn StdError>>** | *результат отправки*
fn send_error_message(rabbit: &Rabbit, queue_name: &str, message: &str) -> Result<(), Box<dyn StdError>> {
    let message: Message<OsrmMessageData> = Message {
        data: OsrmMessageData {
            coordinates: vec![],
            legs: &vec![]
        },
        description: message.to_string(),
        send_time: Local::now().to_string()
    };

    rabbit.send_message(queue_name, message)?;

    Ok(())
}
