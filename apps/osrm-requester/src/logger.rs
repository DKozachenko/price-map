use chrono::Local;
/// Логгер
#[derive(Default)]
pub struct Logger;

impl Logger {
    /// Получение текущей даты и времени в нужном формате
    fn get_now_str(&self) -> String {
        Local::now().format("%d.%m.%Y %H:%M:%S").to_string()
    }

    pub fn new() -> Self {
        Logger
    }

    /// Информационный лог
    pub fn log(&self, message: &str, context: &str) {
        let now_str: String = self.get_now_str();
        println!("\x1b[0;32m{}\tLOG\x1b[0;33m [{}]\x1b[0;32m {}\x1b[0;37m", now_str, context, message);
    }

    /// Лог об ошибке
    pub fn error(&self, message: &str, context: &str) {
        let now_str: String = self.get_now_str();
        println!("\x1b[0;31m{}\tERROR\x1b[0;33m [{}]\x1b[0;31m {}\x1b[0;37m", now_str, context, message);
    }
}
