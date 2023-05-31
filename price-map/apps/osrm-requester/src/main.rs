pub mod logger;
pub mod rabbit;

use std::{process, fs, result::Result, error::Error as StdError, borrow, vec};
use amiquip::{Connection, ConsumerMessage, ConsumerOptions, Publish, QueueDeclareOptions, Exchange, Channel, Queue, Consumer, Error};
use geo_types::{LineString};
use reqwest::blocking::Response;
use serde::{Serialize, Deserialize};
use polyline::{self, decode_polyline};
use serde_yaml;
use chrono::prelude::*;

use logger::Logger;
use rabbit::Rabbit;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "kebab-case")]
struct Config {
    request_queue: String,
    response_queue: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Coordinates {
    latitude: f32,
    longitude: f32,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct Message<T> {
    data: T,
    description: String,
    send_time: String
}

#[derive(Serialize, Deserialize, Debug)]
struct OsrmData {
    routes: Vec<OsrmRoute>
}

#[derive(Serialize, Deserialize, Debug)]
struct OsrmRoute {
    geometry: String,
    legs: Vec<OsmrLeg>
}

#[derive(Serialize, Deserialize, Debug)]
struct OsmrLeg {
    distance: f32,
    summary: String,
    steps: Vec<OsrmStep>
}

#[derive(Serialize, Deserialize, Debug)]
struct OsrmStep {
    maneuver: OsrmManeuver
}

#[derive(Serialize, Deserialize, Debug)]
struct OsrmManeuver {
    r#type: String,
    modifier: Option<String>,
    location: Vec<f32>,
    bearing_after: i32,
    bearing_before: i32
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MessageData<'a> {
    coordinates: Vec<Vec<f64>>,
    legs: &'a Vec<OsmrLeg>
}

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

                let decoded_line_string: LineString = match decode_polyline(&osrm_data.routes[0].geometry, 5) {
                    Ok(line_string) => line_string,
                    Err(err) => {
                        logger.error(format!("Error while decoding polyline: {}, error {}", &osrm_data.routes[0].geometry, err).as_str(), "main");
                        send_error_message(&rabbit, &config.response_queue, "Не удалось получить данные")?;
                        break;
                    },
                };

                let coordinates: Vec<Vec<f64>> = get_coordinates(decoded_line_string);
                let message: Message<MessageData> = Message {
                    data: MessageData {
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
    });

    Ok(())
}

fn get_config() -> Result<Config, Box<dyn StdError>> {
    let config_file_str: String = fs::read_to_string("config/config.yaml")?;
    let config: Config = serde_yaml::from_str(&config_file_str)?;

    Ok(config)
}

fn get_coordinates_str(coordinates_array: Vec<Coordinates>) -> String {
  let mut result: String = String::new();

  for (i, coordinates) in coordinates_array.iter().enumerate() {
    if i == coordinates_array.len() - 1 {
      result.push_str(format!("{},{}", coordinates.longitude, coordinates.latitude).as_str());
    } else {
      result.push_str(format!("{},{};", coordinates.longitude, coordinates.latitude).as_str());
    }
  }

  result
}

fn get_coordinates(line_string: LineString) -> Vec<Vec<f64>> {
    let mut result: Vec<Vec<f64>> = Vec::new();

    for coordinate in line_string {
        let mut coordinate_vector: Vec<f64> = Vec::new();
        coordinate_vector.push(coordinate.x);
        coordinate_vector.push(coordinate.y);

        result.push(coordinate_vector);
    }

    result
}

fn send_error_message(rabbit: &Rabbit, queue_name: &str, message: &str) -> Result<(), Box<dyn StdError>> {
    let message: Message<MessageData> = Message {
        data: MessageData {
            coordinates: vec![],
            legs: &vec![]
        },
        description: message.to_string(),
        send_time: Local::now().to_string()
    };

    rabbit.send_message(queue_name, message)?;

    Ok(())
}
