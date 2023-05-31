use serde::{Serialize, Deserialize};
use std::{fs, result::Result, error::Error as StdError};
use geo_types::LineString;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "kebab-case")]
pub struct Config {
    pub request_queue: String,
    pub response_queue: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Coordinates {
    latitude: f32,
    longitude: f32,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Message<T> {
    pub data: T,
    pub description: String,
    pub send_time: String
}


#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MessageData<'a> {
    pub coordinates: Vec<Vec<f64>>,
    pub legs: &'a Vec<OsmrLeg>
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmData {
    pub routes: Vec<OsrmRoute>
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmRoute {
    pub geometry: String,
    pub legs: Vec<OsmrLeg>
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OsmrLeg {
    distance: f32,
    summary: String,
    steps: Vec<OsrmStep>
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmStep {
    maneuver: OsrmManeuver
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmManeuver {
    r#type: String,
    modifier: Option<String>,
    location: Vec<f32>,
    bearing_after: i32,
    bearing_before: i32
}

pub fn get_config() -> Result<Config, Box<dyn StdError>> {
  let config_file_str: String = fs::read_to_string("config/config.yaml")?;
  let config: Config = serde_yaml::from_str(&config_file_str)?;

  Ok(config)
}

pub fn get_coordinates_str(coordinates_array: Vec<Coordinates>) -> String {
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

pub fn get_coordinates(line_string: LineString) -> Vec<Vec<f64>> {
  let mut result: Vec<Vec<f64>> = Vec::new();

  for coordinate in line_string {
      let mut coordinate_vector: Vec<f64> = Vec::new();
      coordinate_vector.push(coordinate.x);
      coordinate_vector.push(coordinate.y);

      result.push(coordinate_vector);
  }

  result
}
