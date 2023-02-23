import pika

class RabbitService:
  def __init__(self):
    self.connection = None
    self.channel = None

  def init_connection(self):
    self.connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672))
    self.channel = self.connection.channel()

  def send_message(self, exchange, routing_key, data):
    strJsonData = str(data).replace('\'', '"')
    self.channel.basic_publish(exchange=exchange, routing_key=routing_key, body=strJsonData)
