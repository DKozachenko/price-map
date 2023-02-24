import pika
from typing import Any, Optional
import jsonpickle

class RabbitService:
  """ Сервис взаимодействия с Rabbit
  """

  def __init__(self) -> None:
    self.__connection: Optional[pika.BlockingConnection] = None
    self.__channel: Optional[Any] = None

  def init_connection(self) -> None:
    """ Инициализация соединения
    """

    self.__connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672))
    self.__channel = self.__connection.channel()

  # дженерик бы бахнуть к данным то, заюш
  def send_message(self, exchange: str, routing_key: str, data: Any) -> None:
    """ Отправка сообщения

    Args:
        exchange (str): название обменника
        routing_key (str): ключ маршрутизации
        data (Any): произвольные данные
    """

    # str_json_data: str = str(data).replace('\'', '"')
    str_json_data = str(jsonpickle.encode(data, unpicklable=False))
    self.__channel.basic_publish(exchange=exchange, routing_key=routing_key, body=str_json_data)
    print(f'Send message to {exchange} with {routing_key} routing key, data: {str_json_data}')
