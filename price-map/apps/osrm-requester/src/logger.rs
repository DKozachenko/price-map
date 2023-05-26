use chrono::Local;

pub struct Logger;

impl Logger {
    pub fn new() -> Self {
        Logger
    }

    pub fn log(&self, message: &str, context: &str) -> () {
        let now_str: String = Local::now().format("%d.%m.%Y %H:%M:%S").to_string();
        println!("\x1b[0;32m{}\tLOG\x1b[0;33m [{}]\x1b[0;32m {}\x1b[0;37m", now_str, context, message);
    }

    pub fn error(&self, message: &str, context: &str) -> () {
        let now_str: String = Local::now().format("%d.%m.%Y %H:%M:%S").to_string();
        println!("\x1b[0;31m{}\tERROR\x1b[0;33m [{}]\x1b[0;31m {}\x1b[0;37m", now_str, context, message);
    }
}
