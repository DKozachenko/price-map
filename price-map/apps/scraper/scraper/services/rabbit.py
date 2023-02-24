import pika
from typing import Any, Optional

class RabbitService:
  def __init__(self) -> None:
    self.connection: Optional[pika.BlockingConnection] = None
    self.channel: Optional[pika.BlockingConnection] = None

  def init_connection(self) -> None:
    self.connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672))
    self.channel = self.connection.channel()

  def send_message(self, exchange: str, routing_key: str, data: Any) -> None:
    strJsonData: str = str(data).replace('\'', '"')
    self.channel.basic_publish(exchange=exchange, routing_key=routing_key, body=strJsonData)
