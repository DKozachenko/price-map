import pika
from typing import Any, Optional

class RabbitService:
  def __init__(self) -> None:
    self.__connection: Optional[pika.BlockingConnection] = None
    self.__channel: Optional[Any] = None

  def init_connection(self) -> None:
    self.__connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672))
    self.__channel = self.__connection.channel()

  def send_message(self, exchange: str, routing_key: str, data: Any) -> None:
    str_json_data: str = str(data).replace('\'', '"')
    self.__channel.basic_publish(exchange=exchange, routing_key=routing_key, body=str_json_data)
