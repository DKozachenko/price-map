use std::{process, fs, result::Result, error::Error, borrow};
use amiquip::{Connection, ConsumerMessage, ConsumerOptions, Publish, QueueDeclareOptions, Exchange, Channel, Queue, Consumer};
use geo_types::{LineString};
use reqwest::blocking::Response;
use serde::{Serialize, Deserialize};
use polyline;
use serde_yaml;
use chrono::prelude::*;

use crate::logger::Logger;

pub mod logger;

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

fn main() -> Result<(), Box<dyn Error>> {
    let logger: Logger = Logger::new();
    logger.log("Application start", "main");

    let config: Config = get_config().unwrap_or_else(|err| {
        logger.error(format!("Error while getting config file: {}", err).as_str(), "main");
        process::exit(-1);
    });

    let mut connection: Connection = Connection::insecure_open("amqp://admin:admin_rabbit@localhost:5672").unwrap_or_else(|err| {
        logger.error(format!("Error while setting connection: {}", err).as_str(), "main");
        process::exit(-1);
    });

    let channel: Channel = connection.open_channel(None).unwrap_or_else(|err| {
        logger.error(format!("Error while openning channel: {}", err).as_str(), "main");
        process::exit(-1);
    });

    let queue: Queue = channel.queue_declare(&config.request_queue, QueueDeclareOptions {
      durable: true,
      ..QueueDeclareOptions::default()
    }).unwrap_or_else(|err| {
        logger.error(format!("Error while getting queue: {}", err).as_str(), "main");
        process::exit(-1);
    });


    let consumer: Consumer = queue.consume(ConsumerOptions::default()).unwrap_or_else(|err| {
        logger.error(format!("Error while closing channel: {}", err).as_str(), "main");
        process::exit(-1);
    });

    for (_i, message) in consumer.receiver().iter().enumerate() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                logger.log(format!("Message from {}, content length: {}", &config.request_queue, delivery.body.len()).as_str(), "main");
                let body: borrow::Cow<str> = String::from_utf8_lossy(&delivery.body);
                let message: Message<Vec<Coordinates>> = serde_json::from_str(&body).unwrap_or_else(|err| {
                    logger.error(format!("Error while deserializing message {}, error: {}", body, err).as_str(), "main");
                    process::exit(-1);
                });
                consumer.ack(delivery).unwrap_or_else(|err| {
                    logger.error(format!("Error while acking message: {}", err).as_str(), "main");
                    process::exit(-1);
                });

                let coordinates_str: String = get_coordinates_str(message.data);

                let url: String = format!("http://router.project-osrm.org/route/v1/driving/{}?overview=full&steps=true", coordinates_str);

                logger.log(format!("Send http request to {}", url).as_str(), "main");
                let response: Response = reqwest::blocking::get(&url).unwrap_or_else(|err| {
                    logger.error(format!("Error while sending request: {}, error {}", url, err).as_str(), "main");
                    process::exit(-1);
                });

                let osrm_data: OsrmData = response.json::<OsrmData>().unwrap_or_else(|err| {
                    logger.error(format!("Error while deserializing data from response: {}", err).as_str(), "main");
                    process::exit(-1);
                });

                let decoded_line_string: LineString = polyline::decode_polyline(&osrm_data.routes[0].geometry, 5).unwrap_or_else(|err| {
                    logger.error(format!("Error while decoding polyline: {}, error {}", &osrm_data.routes[0].geometry, err).as_str(), "main");
                    process::exit(-1);
                });

                let coordinates: Vec<Vec<f64>> = get_coordinates(decoded_line_string);

                let message: Message<MessageData> = Message {
                    data: MessageData {
                        coordinates,
                        legs: &osrm_data.routes[0].legs
                    },
                    description: String::from("Успешное построение маршрута"),
                    send_time: Local::now().to_string()
                };

                let message_str: String = serde_json::to_string(&message).unwrap_or_else(|err| {
                    logger.error(format!("Error while serializing message: {:?}, error {}", message, err).as_str(), "main");
                    process::exit(-1);
                });

                let exchange: Exchange = Exchange::direct(&channel);
                let body: &[u8] = message_str.as_bytes();
                exchange.publish(Publish::new(body, &config.response_queue)).unwrap_or_else(|err| {
                    logger.error(format!("Error while publishing message: {}, error {}", message_str, err).as_str(), "main");
                    process::exit(-1);
                });
                logger.log(format!("Send message to {}, content length: {}", &config.response_queue, body.len()).as_str(), "main");
            }
            other => {
                logger.log(format!("Consumer ended: {:?}", other).as_str(), "main");
                break;
            }
        }
    }

    connection.close().unwrap_or_else(|err| {
        logger.error(format!("Error while closing connection: {}", err).as_str(), "main");
        process::exit(-1);
    });

    Ok(())
}

fn get_config() -> Result<Config, Box<dyn Error>> {
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
