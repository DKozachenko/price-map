use serde::{Serialize, Deserialize};
use std::fs;
use geo_types::LineString;
use anyhow::Result;

/// Конфиг
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "kebab-case")]
pub struct Config {
    /// **String** | *очередь для запроса*
    pub request_queue: String,
    /// **String** | *очередь для ответа*
    pub response_queue: String,
}

/// Координата
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Coordinates {
    /// **f32** | *широта*
    latitude: f32,
    /// **f32** | *долгота*
    longitude: f32,
}

/// Сообщение (интерфейс обмена данными между сервисами)
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Message<T> {
    /// **T** | *произвольные данные*
    pub data: T,
    /// **String** | *описание*
    pub description: String,
    /// **String** | *время отправки*
    pub send_time: String
}

/// Данные из OSRM для отправки в очередь
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct OsrmMessageData<'a> {
    /// **Vec<[f64; 2]>** | *координаты*
    pub coordinates: Vec<[f64; 2]>,
    /// **Vec<OsmrLeg>** | *маршруты между двумя ключевыми точками*
    pub legs: &'a Vec<OsmrLeg>
}

/// Данные OSRM
#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmData {
    /// **Vec<OsrmRoute>** | *маршруты*
    pub routes: Vec<OsrmRoute>
}

/// Маршрут OSRM
#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmRoute {
    /// **String** | *геометрия (полигон)*
    pub geometry: String,
    /// **Vec<OsmrLeg>** | *Маршруты между двумя ключевыми точками*
    pub legs: Vec<OsmrLeg>
}

/// Маршрут между двумя ключевыми точками
#[derive(Serialize, Deserialize, Debug)]
pub struct OsmrLeg {
    /// **f32** | *дистанция*
    distance: f32,
    /// **String** | *резюмирующий текст*
    summary: String,
    /// **Vec<OsrmStep>** | *шаги*
    steps: Vec<OsrmStep>
}

/// Шаг OSRM
#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmStep {
    /// **OsrmManeuver** | *маневр*
    maneuver: OsrmManeuver
}

/// Маневр OSRM
#[derive(Serialize, Deserialize, Debug)]
pub struct OsrmManeuver {
    /// **String** | *тип*
    r#type: String,
    /// **Option<String>** | *модификатор*
    modifier: Option<String>,
    /// **Vec<f32>** | *локация (координаты)*
    location: Vec<f32>,
    /// **i32** | *угол до*
    bearing_after: i32,
    /// **i32** | *угол после*
    bearing_before: i32
}

/// Получение конфига
/// #### args:
/// #### return:
/// - **Result<Config, Box<dyn StdError>>** | *результат получения (конфиг или ошибка)*
pub fn get_config() -> Result<Config> {
  let config_file_str: String = fs::read_to_string("config/config.yaml")?;
  let config: Config = serde_yaml::from_str(&config_file_str)?;

  Ok(config)
}

/// Получение строки координат (склеивание координат через запятую)
/// #### args:
/// - coordinates_array | **Vec<Coordinates>** | *массив координат*
/// #### return:
/// - **String** | *строка координат*
pub fn get_coordinates_str(coordinates_array: Vec<Coordinates>) -> String {
    coordinates_array
        .into_iter()
        .map(|c| format!("{},{}", c.longitude, c.latitude))
        .collect::<Vec<String>>()
        .join(";")
}

/// Получение координат из LineString
/// #### args:
/// - line_string | **LineString** | *LineString*
/// #### return:
/// - **Vec<[f64; 2]>** | *массив кооринат*
pub fn get_coordinates(line_string: LineString) -> Vec<[f64; 2]> {
    line_string
        .into_iter()
        .map(|c| [c.x, c.y])
        .collect()
}
