import pika
from typing import Any
import jsonpickle
from services.logger import LoggerService
from entities.message import Message

class RabbitService:
  """ Сервис взаимодействия с Rabbit
  """

  def __init__(self) -> None:
    self.__connection: pika.BlockingConnection | None = None
    """ Соединение """
    self.__channel: Any | None = None
    """ Канал """
    self.logger_service: LoggerService = LoggerService()
    """ Логер """

  def __init_connection(self) -> None:
    """ Инициализация соединения
    """

    self.__connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672))
    self.__channel = self.__connection.channel()

  def json_stringify(self, data: Message) -> str:
    """ Преобразование данных в строку

    Args:
      data (Message): сообщение с произвольными данными

    Returns:
      str: строка
    """
    
    jsonpickle.set_preferred_backend('json')
    jsonpickle.set_encoder_options('json', ensure_ascii=False)
    str_json_data = str(jsonpickle.encode(data, unpicklable=False))
    return str_json_data

  def send_message(self, exchange: str, routing_key: str, message: Message) -> None:
    """ Отправка сообщения

    Args:
      exchange (str): название обменника
      routing_key (str): ключ маршрутизации
      message (Message): сообщение с произвольными данными
    """

    str_json_data = self.json_stringify(message)
    self.__init_connection()
    self.__channel.basic_publish(exchange=exchange, routing_key=routing_key, body=str_json_data)
    self.logger_service.log(f'Send message to {exchange} with {routing_key} routing key', 'RabbitService')
    self.__connection.close()
