from app.app import App
from services.logger import LoggerService

logger_service: LoggerService = LoggerService()
logger_service.log('Before creating app instance', 'test.py')
app: App = App()
logger_service.log('After creating app instance', 'test.py')