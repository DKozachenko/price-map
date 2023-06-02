use serde::{Serialize, Deserialize};
use geo_types::LineString;

/// Координата
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Coordinate {
    /// Широта
    latitude: f32,
    /// Долгота
    longitude: f32,
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
