use std::borrow;
use amiquip::{Connection, ConsumerMessage, ConsumerOptions, Publish, QueueDeclareOptions, Result, Exchange};
use geo_types::{LineString, Line};
use serde::{Serialize, Deserialize};
use polyline;
use chrono::prelude::*;

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

fn main() {
    let mut connection = Connection::insecure_open("amqp://admin:admin_rabbit@localhost:5672").unwrap();

    // Open a channel - None says let the library choose the channel ID.
    let channel = connection.open_channel(None).unwrap();

    // let queue = channel.q  ("hello", QueueDeclareOptions::default())?;
    let queue = channel.queue_declare("osrm_requester_request_queue", QueueDeclareOptions {
      durable: true,
      ..QueueDeclareOptions::default()
    }).unwrap();


    // Start a consumer.
    let consumer = queue.consume(ConsumerOptions::default()).unwrap();
    println!("Waiting for messages. Press Ctrl-C to exit.");

    for (i, message) in consumer.receiver().iter().enumerate() {
        match message {
            ConsumerMessage::Delivery(delivery) => {
                let body: borrow::Cow<str> = String::from_utf8_lossy(&delivery.body);
                let deserialized: Message<Vec<Coordinates>> = serde_json::from_str(&body).unwrap();
                println!("deserialized = {:?}", deserialized);
                let coordinates_array: Vec<Coordinates> = deserialized.data;
                println!("Coordinates string {:?}", coordinates_array);
                consumer.ack(delivery).unwrap();

                let coordinates_str: String = get_coordinates_str(coordinates_array);

                let query: String = format!("http://router.project-osrm.org/route/v1/driving/{}?overview=full&steps=true", coordinates_str);
                println!("{query}");

                let resp = reqwest::blocking::get(query).unwrap().json::<OsrmData>().unwrap();
                // println!("{:#?}", resp);

                let mut decoded = polyline::decode_polyline(&resp.routes[0].geometry, 5).unwrap();

                let coordinates = map_line_string(decoded);

                let message = Message {
                    data: MessageData {
                        coordinates,
                        legs: &resp.routes[0].legs
                    },
                    description: String::from("Temp 2"),
                    send_time: Local::now().to_string()
                };

                let serialized = serde_json::to_string(&message).unwrap();
                // println!("serialized = {}", serialized);

                let exchange = Exchange::direct(&channel);
                exchange.publish(Publish::new(serialized.as_bytes(), "osrm_requester_response_queue")).unwrap();
                println!("message to osrm_requester_response_queue");
            }
            other => {
                println!("Consumer ended: {:?}", other);
                break;
            }
        }
    }

    connection.close().unwrap();
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

fn map_line_string(line_string: LineString) -> Vec<Vec<f64>> {
    let mut result = Vec::new();

    for coord in line_string {
        let mut coord_vec = Vec::new();
        coord_vec.push(coord.x);
        coord_vec.push(coord.y);

        result.push(coord_vec);
    }

    result
}
