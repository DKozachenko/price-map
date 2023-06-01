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
pub struct Coordinates {
    /// Широта
    latitude: f32,
    /// Долгота
    longitude: f32,
}

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

/// Данные из OSRM для отправки в очередь
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct OsrmMessageData<'a> {
    /// Координаты
    pub coordinates: Vec<[f64; 2]>,
    /// Маршруты между двумя ключевыми точками
    pub legs: &'a Vec<OsmrLeg>
}

/// Данные OSRM
#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmData {
    /// Маршруты
    pub routes: Vec<OsrmRoute>
}

/// Маршрут OSRM
#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmRoute {
    /// Геометрия (полигон)
    pub geometry: String,
    /// Маршруты между двумя ключевыми точками
    pub legs: Vec<OsmrLeg>
}

/// Маршрут между двумя ключевыми точками
#[derive(Serialize, Deserialize, Debug)]
pub struct OsmrLeg {
    /// Дистанция
    distance: f32,
    /// Резюмирующий текст
    summary: String,
    /// Шаги
    steps: Vec<OsrmStep>
}

/// Шаг OSRM
#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmStep {
    /// Маневр
    maneuver: OsrmManeuver
}

/// Маневр OSRM
#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmManeuver {
    /// Тип
    r#type: String,
    /// Модификатор
    modifier: Option<String>,
    /// локация (координаты)
    location: Vec<f32>,
    /// Угол до
    bearing_after: i32,
    /// Угол после
    bearing_before: i32
}

/// Получение конфига
pub fn get_config() -> Result<Config> {
  let config_file_str: String = fs::read_to_string("config/config.yaml")?;
  let config: Config = serde_yaml::from_str(&config_file_str)?;

  Ok(config)
}

/// Получение строки координат (склеивание координат через запятую)
pub fn get_coordinates_str(coordinates_array: Vec<Coordinates>) -> String {
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
