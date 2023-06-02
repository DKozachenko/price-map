use serde::{Serialize, Deserialize};
use std::fs;

/// Конфиг
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "kebab-case")]
pub struct Config {
    /// Очередь для запроса
    pub request_queue: String,
    /// Очередь для ответа
    pub response_queue: String,
}

/// Получение конфига
pub fn get_config() -> anyhow::Result<Config> {
  let config_file_str: String = fs::read_to_string("config/config.yaml")?;
  let config: Config = serde_yaml::from_str(&config_file_str)?;

  Ok(config)
}
