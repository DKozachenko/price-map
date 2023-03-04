from typing import Callable, TypeVar
from selenium import webdriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium_stealth import stealth
from chromedriver_py import binary_path as DRIVER_PATH
import time

T = TypeVar('T')
K = TypeVar('K')

class BaseScrapingService:
  """ Базовый класс для сервисов-скреперов
  """

  def __init__(self) -> None:
    self._driver: webdriver.Chrome | None = None

  def _init_driver(self) -> None:
    """ Инициализация драйвера
    """

    options: webdriver.ChromeOptions = webdriver.ChromeOptions()
    options.add_argument("start-maximized")
    options.add_argument('ignore-certificate-errors')
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

  def _filter_elements(self, callback: Callable[[K], bool], elements: list[K]) -> list[K]:
    """ Фильтрация элементов

    Args:
      callback (Callable[[K], bool]): колбэк
      elements (list[K]): элементы для фильтрации

    Returns:
      list[K]: отфильтрованные элементы
    """
    
    return list(filter(callback, elements))

  def _get_element_by_selector(self, selector: str, parent: WebElement | None = None) -> WebElement:
    """ Получение элемента по селектору

    Args:
      selector (str): селектор
      parent (WebElement | None, optional): родитель. Defaults to None.

    Returns:
      WebElement: элемент
    """

    if parent:
      element: WebElement = parent.find_element(By.CSS_SELECTOR, selector)
      return element
    else:
      element: WebElement = self._driver.find_element(By.CSS_SELECTOR, selector)
      return element

  def _get_elements_by_selector(self, selector: str, parent: WebElement | None = None) -> list[WebElement]:
    """ Получение элементов по селектору

    Args:
      selector (str): селектор
      parent (WebElement | None, optional): родитель. Defaults to None.

    Returns:
      list[WebElement]: список элементов
    """

    if parent:
      elements: list[WebElement] = parent.find_elements(By.CSS_SELECTOR, selector)
      return elements
    else:
      elements: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, selector)
      return elements

  def _get_text_from_element(self, selector: str, parent: WebElement | None = None) -> str:
    """ Получение текста из элемента по селектору

    Args:
      selector (str): селектор
      parent (WebElement | None, optional): родитель. Defaults to None.

    Returns:
      str: текст
    """

    element: WebElement = self._get_element_by_selector(selector, parent)
    text: str = element.text
    return text
  
  def _get_text_from_prop(self, element: WebElement) -> str:
    """ Получение текста из элемента по свойству

    Args:
      element (WebElement): элемент

    Returns:
      str: текст
    """

    return element.text

  def _get_attribute_from_prop(self, element: WebElement, attr: str) -> str:
    """ Получение атрибута из элемента

    Args:
      element (WebElement): элемент
      attr (str): название атрибута

    Returns:
      str: значение атрибута
    """

    return element.get_attribute(attr)

  def _get_attribute_from_element(self, attribute: str, selector: str, parent: WebElement | None = None) -> str:
    """ Получение значение атрибута

    Args:
      attribute (str): атрибут
      selector (str): селектор
      parent (WebElement | None, optional): родитель. Defaults to None.

    Returns:
      str: атрибут
    """

    element: WebElement = self._get_element_by_selector(selector, parent)
    attr: str = element.get_attribute(attribute)
    return attr
  
  def _scroll(self, element: WebElement) -> None:
    """ Скролл к элементу

    Args:
      element (WebElement): элемент
    """

    actions: ActionChains = ActionChains(self._driver)
    actions.scroll_to_element(element).perform()

  def _click(self, element: WebElement) -> None:
    """ Клик на элемент

    Args:
      element (WebElement): элемент
    """

    actions: ActionChains = ActionChains(self._driver)
    actions.move_to_element(element).click(element).perform()

  def _hover(self, element: WebElement) -> None:
    """ Наведение на элемент

    Args:
      element (WebElement): элемент
    """

    actions: ActionChains = ActionChains(self._driver)
    actions.move_to_element(element).perform()

  def _execute(self, callback: Callable, default_value: T, *args) -> T:
    """"""
    """ Выполнить какое-либо действие, которое возвращает значение

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
      func_name: str = getattr(callback, '__name__', 'Unknown name')
      print(f'Exception in "{func_name}" method with args ${args}, returned a {str(default_value)} value')
      return default_value

  def _wait(self, secs: int) -> None:
    """ Ожидание

    Args:
      secs (_type_): кол-во секунд
    """
    time.sleep(secs)


