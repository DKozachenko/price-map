from typing import Callable, Optional, TypeVar
from selenium import webdriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium_stealth import stealth
from chromedriver_py import binary_path as DRIVER_PATH

import time
from constants.cookies import COOKIES

T = TypeVar('T')

class BaseScrapingService:
  """ Базовый класс для сервисов-скреперов
  """

  def __init__(self) -> None:
    self._driver: Optional[webdriver.Chrome] = None

  def _is_showed_captcha(self) -> bool:
    """ Показана ли капча

    Returns:
      bool: true / false
    """

    title: str = self._driver.title
    return title == 'Ой!'

  def _init_driver(self) -> None:
    """ Инициализация драйвера
    """

    options: webdriver.ChromeOptions = webdriver.ChromeOptions()
    options.add_argument("start-maximized")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)

    service: Service = Service(DRIVER_PATH)
    self._driver = webdriver.Chrome(service=service, options=options)
    stealth(self._driver,
      user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.53 Safari/537.36',
      languages=["ru-RU", "ru"],
      vendor="Google Inc.",
      platform="Win32",
      webgl_vendor="Intel Inc.",
      renderer="Intel Iris OpenGL Engine",
      fix_hairline=True,
    )

  def _set_cookies(self) -> None:
    """ Установка куки
    """

    for cookie in COOKIES:
      self._driver.add_cookie({
        "name": cookie["name"],
        "value": cookie["value"],
        "domain": cookie["domain"]
      })

  def _get_element_by_selector(self, selector: str, parent: WebElement | None = None) -> WebElement:
    """ Получение элемента по селектору

    Args:
      selector (str): селектор
      parent (WebElement | None, optional): родитель. Defaults to None.

    Returns:
      WebElement: элемент
    """

    # try:
    if parent:
      element: WebElement = parent.find_element(By.CSS_SELECTOR, selector)
      return element
    else:
      element: WebElement = self._driver.find_element(By.CSS_SELECTOR, selector)
      return element
    # except:
    #   print(f'Couldn\'t get element with selector {selector}')
    #   return None

  def _get_element_by_id(self, id: str, parent: WebElement | None = None) -> WebElement:
    """ Получение элемента по id

    Args:
      id (str): id
      parent (WebElement | None, optional): родитель. Defaults to None.

    Returns:
      WebElement: элемент
    """

    # try:
    if parent:
      element: WebElement = parent.find_element(By.ID, id)
      return element
    else:
      element: WebElement = self._driver.find_element(By.ID, id)
      return element
    # except:
    #   print(f'Couldn\'t get element with id {id}')
    #   return None

  def _get_elements_by_selector(self, selector: str, parent: WebElement | None = None) -> list[WebElement]:
    """ Получение элементов по селектору

    Args:
      selector (str): селектор
      parent (WebElement | None, optional): родитель. Defaults to None.

    Returns:
      list[WebElement]: список элементов
    """

    # try:
    if parent:
      elements: list[WebElement] = parent.find_elements(By.CSS_SELECTOR, selector)
      return elements
    else:
      elements: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, selector)
      return elements
    # except:
    #   print(f'Couldn\'t get elements with selector {selector}')
    #   return []

  def _get_text_from_element(self, selector: str, parent: WebElement | None = None) -> str:
    """ Получение текста из селектора

    Args:
      selector (str): селектор
      parent (WebElement | None, optional): родитель. Defaults to None.

    Returns:
      str: текст
    """

    # try:
    element: WebElement = self._get_element_by_selector(selector, parent)
    text: str = element.text
    return text
    # except:
    #   print(f'Couldn\'t get text, selenium id {element.id}')
    #   return ''

  def _get_attribute_from_element(self, attribute: str, selector: str, parent: WebElement | None = None) -> str:
    """ Получение значение атрибута

    Args:
      attribute (str): атрибут
      selector (str): селектор
      parent (WebElement | None, optional): родитель. Defaults to None.

    Returns:
      str: атрибут
    """

    # try:
    element: WebElement = self._get_element_by_selector(selector, parent)
    attr: str = element.get_attribute(attribute)
    return attr
    # except:
    #   print(f'Couldn\'t get text, selenium id {element.id}')
    #   return ''


  def _execute(callback: Callable, default_value: T, *args) -> T:
    """ Выполнить какое-либо действие

    Args:
      callback (Callable): действие (функция)
      default_value (T): дефолтное значение (в случае ошибки)

    Returns:
      T: значение
    """

    try:
      value: T = callback(*args)
      return value
    except:
      print(f'Exception in "_get" method, returned a {default_value} value')
      return default_value

  def _wait(secs) -> None:
    time.sleep(secs)


