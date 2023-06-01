use serde::{Serialize, Deserialize};

/// Данные из OSRM для отправки в очередь
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct OsrmMessageData {
    /// Координаты
    pub coordinates: Vec<[f64; 2]>,
    /// Маршруты между двумя ключевыми точками
    // pub legs: &'a Vec<OsmrLeg>
    pub legs: Vec<OsmrLeg>
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
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OsmrLeg {
    /// Дистанция
    distance: f32,
    /// Резюмирующий текст
    summary: String,
    /// Шаги
    steps: Vec<OsrmStep>
}

/// Шаг OSRM
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OsrmStep {
    /// Маневр
    maneuver: OsrmManeuver
}

/// Маневр OSRM
#[derive(Serialize, Deserialize, Debug, Clone)]
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
