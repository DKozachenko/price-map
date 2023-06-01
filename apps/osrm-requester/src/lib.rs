use serde::{Serialize, Deserialize};
use std::fs;
use geo_types::LineString;
use anyhow::Result;

/// Конфиг
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "kebab-case")]
pub struct Config {
    /// Очередь для запроса
    pub request_queue: String,
    /// Очередь для ответа
    pub response_queue: String,
}

/// Координата
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Coordinate {
    /// Широта
    latitude: f32,
    /// Долгота
    longitude: f32,
}

/// Получение конфига
pub fn get_config() -> Result<Config> {
  let config_file_str: String = fs::read_to_string("config/config.yaml")?;
  let config: Config = serde_yaml::from_str(&config_file_str)?;

  Ok(config)
}

/// Получение строки координат (склеивание координат через запятую)
pub fn get_coordinates_str(coordinates_array: Vec<Coordinate>) -> String {
    coordinates_array
        .into_iter()
        .map(|c| format!("{},{}", c.longitude, c.latitude))
        .collect::<Vec<String>>()
        .join(";")
}

/// Получение координат из LineString
pub fn get_coordinates(line_string: LineString) -> Vec<[f64; 2]> {
    line_string
        .into_iter()
        .map(|c| [c.x, c.y])
        .collect()
}
