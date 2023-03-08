from datetime import datetime
import pytz

class LoggerService:
  """ Логгер
  """

  def __init__(self) -> None:
    pass

  def __get_log_datetime(self) -> str:
    """ Получение отформатированной строки с текущим временем 

    Returns:
      str: строка
    """

    format = '%d.%m.%Y %H:%M:%S'
    now: datetime = datetime.now(pytz.timezone('Asia/Novosibirsk'))
    formatted_now: str = now.strftime(format)
    return formatted_now

  def log(self, message: str, context: str) -> None:
    """ Обычное сообщение

    Args:
      message (str): сообщение
      context (str): контекст
    """
    
    formatted_now: str = self.__get_log_datetime()
    print(f'\033[0;32m {formatted_now}\tLOG\033[0;33m [{context}]\033[0;32m {message}\033[0;37m')

  def error(self, message: str, context: str) -> None:
    """ Сообщение об ошибке

    Args:
      message (str): сообщение
      context (str): контекст
    """

    formatted_now: str = self.__get_log_datetime()
    print(f'\033[0;31m {formatted_now}\tLOG\033[0;33m [{context}]\033[0;31m {message}\033[0;37m')