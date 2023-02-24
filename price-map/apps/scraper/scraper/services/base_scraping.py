from typing import Optional
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium_stealth import stealth
from chromedriver_py import binary_path as DRIVER_PATH

from models.cookies import COOKIES

class BaseScrapingService:
  def __init__(self) -> None:
    self._driver: Optional[webdriver.Chrome] = None

  def _isShowedCaptcha(self) -> bool:
    title: str = self._driver.title
    return title == 'Ой!'

  def _initializeDriver(self) -> None:
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

  def _setCookies(self) -> None:
    for cookie in COOKIES:
      self._driver.add_cookie({
        "name": cookie["name"],
        "value": cookie["value"],
        "domain": cookie["domain"]
      })
