from typing import TypeVar
from datetime import datetime

T = TypeVar("T")

class Message:
  """ Интерфейс обмена сообщениями между бэком и сервисами
  """

  def __init__(self, data: T, description: str, sendTime: datetime) -> None:
    self.data: T = data
    """ Данные """
    self.description: str = description
    """ Описание """
    self.sendTime: datetime = sendTime
    """ Время отправки """


