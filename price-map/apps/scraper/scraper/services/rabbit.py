import pika
from typing import Any, Optional
import jsonpickle

class RabbitService:
  """ Сервис взаимодействия с Rabbit
  """

  def __init__(self) -> None:
    self.__connection: Optional[pika.BlockingConnection] = None
    self.__channel: Optional[Any] = None

  def __init_connection(self) -> None:
    """ Инициализация соединения
    """

    self.__connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672))
    self.__channel = self.__connection.channel()

  def send_message(self, exchange: str, routing_key: str, data: Any) -> None:
    self.__init_connection()
    """ Отправка сообщения

    Args:
      exchange (str): название обменника
      routing_key (str): ключ маршрутизации
      data (Any): произвольные данные
    """

    jsonpickle.set_preferred_backend('json')
    jsonpickle.set_encoder_options('json', ensure_ascii=False)
    str_json_data = str(jsonpickle.encode(data, unpicklable=False))
    print(921, str_json_data)
    self.__channel.basic_publish(exchange=exchange, routing_key=routing_key, body=str_json_data)
    print(f'Send message to {exchange} with {routing_key} routing key, data: {str_json_data}')
    self.__connection.close()
