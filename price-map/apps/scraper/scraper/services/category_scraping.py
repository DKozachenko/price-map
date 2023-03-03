from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webelement import WebElement

from constants.max_get_url_attempts import MAX_GET_URL_ATTEMPTS as MAX_EXECUTE_ATTEMPS
from constants.url import URL
from services.base_scraping import BaseScrapingService
from entities.filter import Filter
from entities.category_1_level import Category1Level
from entities.category_2_level import Category2Level
from entities.category_3_level import Category3Level

import jsonpickle

class CategoryScrapingService(BaseScrapingService):
  """ Сервис-скрепер категорий

  Args:
    BaseScrapingService (_type_): наследуется от BaseScrapingService
  """

  def __init__(self) -> None:
    super().__init__()
    self.__category_3_level_links: set[str] = set()
    self.__products_map: dict[str, list[str]] = dict()

  def __open_catalog_popup(self) -> None:
    """ Открытие попапа каталога
    """

    WebDriverWait(self._driver, timeout=3).until(EC.presence_of_element_located((By.CSS_SELECTOR, '.catalog > div > button')))
    catalog_popup_putton: WebElement = self._execute(self._get_element_by_selector, None, '.catalog > div > button')
    self._execute_void(self._click, catalog_popup_putton)

    #ожидание пока прогрузится каталог
    WebDriverWait(self._driver, timeout=10).until(EC.presence_of_element_located((By.CSS_SELECTOR, '.sidebar')))

  def __click_all_more_spans(self) -> None:
    """ Клик на все кнопки "Еще"
    """
    # self._wait(2)
    all_more_spans: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.showmore span')
    current_more_spans: list[WebElement] = list(filter(lambda span: span.is_displayed() == True, all_more_spans))

    for more_span in current_more_spans:
      self._execute_void(self._click, more_span)

  def __get_filters(self) -> list[Filter]:
    """ Получение фильтров

    Returns:
      list[Filter]: список фильтров
    """

    filters: list[Filter] = []
    filter_divs: list[WebElement] = self._execute(self._get_elements_by_selector, None, '.filter')
    filter_divs_displayed: list[WebElement] = []
    
    for filter_div in filter_divs:
      if filter_div.is_displayed() == True:
        filter_divs_displayed.append(filter_div)

    for filter_div in filter_divs_displayed:
      dropdown_content_wrap_div: WebElement = self._execute(self._get_element_by_selector, None, '.droped-content-wrap', filter_div)
      style_str: str = self._execute(self._get_attribute_from_prop, '', dropdown_content_wrap_div, 'style')
      #по стилям определение свернут ли фильтр или нет
      is_collapsed: bool = style_str.find('height: 0px') != -1

      if is_collapsed:
        arrow_div: WebElement = self._execute(self._get_element_by_selector, None, '.is-body-opened.closed', filter_div)
        self._click(arrow_div)
        self._wait(1)

      filter_name: str = self._execute(self._get_text_from_element, '', '.filter-title', filter_div).strip()
      range_input: WebElement = self._execute(self._get_element_by_selector, None, '.range-input', filter_div)
      enum_filter: WebElement = self._execute(self._get_element_by_selector, None, '.enum-filter', filter_div)
      boolean_bilter: WebElement = self._execute(self._get_element_by_selector, None, '.boolean-filter', filter_div)
      # print('range_input', range_input, 'enum_filter', enum_filter, 'boolean_bilter', boolean_bilter)
      if range_input:
        inputs: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'input', range_input)
        min_str: str = self._execute(self._get_attribute_from_prop, '',  inputs[0], 'placeholder') 
        max_str: str = self._execute(self._get_attribute_from_prop, '', inputs[1], 'placeholder') 

        if len(min_str) > 0 and len(max_str) > 0:
          filter: Filter = Filter(filter_name, 'range', [float(min_str), float(max_str)])
          filters.append(filter)
      elif enum_filter:
        show_more_button: WebElement = self._execute(self._get_element_by_selector, None, '.show-more-button', enum_filter)

        if show_more_button:
          self._click(show_more_button)
          self._wait(1)

        values: list[str] = []
        value_spans: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.boolean-filter span', enum_filter)

        for value_span in value_spans:
          #Если элемент не виден, необходимо проскроллить до него, чтобы получить значение
          if value_span.is_displayed() == False:
            self._scroll(value_span)

          value: str = self._execute(self._get_text_from_prop, '', value_span)
          values.append(value)
        if len(values) > 0:
          filter: Filter = Filter(filter_name, 'enum', values)
          filters.append(filter)
      elif boolean_bilter:
        filter: Filter = Filter(filter_name, 'boolean', [])
        filters.append(filter)

    return filters

  def __set_filters(self, categories_1_level: list[Category1Level]) -> None:
    """ Установка фильтров
    """

    for category_3_level_link in list(self.__category_3_level_links):
      self._driver.get(category_3_level_link)
      self._wait(2)

      breadcrumb: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.breadcrumbs-item')
      #breadcrumb состоит из пунтка "Главная"+уровни категорий, тк расчет шел на 3-уровневую систему, то
      #учитываем, только страницы, где длина breadcrumb ("Главная"+3 уровня категорий)
      if len(breadcrumb) == 4:
        category_1_level_name: str = self._execute(self._get_text_from_prop, '', breadcrumb[1]).strip()
        category_2_level_name: str = self._execute(self._get_text_from_prop, '', breadcrumb[2]).strip()
        category_3_level_name: str = self._execute(self._get_text_from_prop, '', breadcrumb[3]).strip()
        print(category_1_level_name, category_2_level_name, category_3_level_name)

        found_categories_1_level = list(filter(lambda item: item.name == category_1_level_name, categories_1_level))

        if len(found_categories_1_level) > 0:
          category_1_level: Category1Level = found_categories_1_level[0]
          found_categories_2_level = list(filter(lambda item: item.name == category_2_level_name, category_1_level.categories2Level))
          category_2_level: Category2Level | None = None
          if len(found_categories_2_level) > 0:
            category_2_level = found_categories_2_level[0]
          
            found_categories_3_level = list(filter(lambda item: category_3_level_name.lower() in item.name.lower()
              or item.name.lower() in category_3_level_name.lower(), category_2_level.categories3Level))
            category_3_level: Category3Level | None = None

            if len(found_categories_3_level) > 0:
              category_3_level = found_categories_3_level[0]

              filters: list[Filter] = self._execute(self.__get_filters, [])
              category_3_level.filters = filters
              # self._wait(120)

              #добавление ссылок на товары в этой категории
              links: list[str] = []
              product_blocks: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.p-card')
              if len(product_blocks) > 0:  
                product_blocks = product_blocks[:5]

                for product_block in product_blocks:
                  product_link: str = self._execute(self._get_attribute_from_element, '', 'href', '.p-card__title-link', product_block)
                  links.append(product_link)

                self.__products_map[category_3_level.name] = links
                if len(self.__products_map.keys()) > 5:
                  print('STOP')
                  return

  #Возможно в первый проход собирать лишь ссылки, а в фильтрах уже сами названию+сразу фильтры
  def __get_categories_1_level(self) -> list[Category1Level]:
    """ Заполнение категорий 1 уровня
    """

    categories_1_level: list[Category1Level] = []
    category_1_level_lis: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.sidebar .nav li')

    # не включается последний элемент, тк это ссылка на весь каталог
    for category_1_level_li in category_1_level_lis[:-1]:
      self._execute_void(self._hover, category_1_level_li)
      self._execute_void(self.__click_all_more_spans)
      
      self._wait(2)

      category_1_level_names_all: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.catalog-title')
      current_category_1_level_name: WebElement = list(filter(lambda span: span.is_displayed() == True, category_1_level_names_all))[0]
      category_1_level_name: str = self._execute(self._get_text_from_prop, '', current_category_1_level_name).capitalize().strip()

      if (len(category_1_level_name) > 0):
        category_1_level: Category1Level = Category1Level(category_1_level_name, [])

        category_2_level_divs_all: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.catalog-block')
        category_2_level_divs: list[WebElement] = list(filter(lambda span: span.is_displayed() == True, category_2_level_divs_all))

        for category_2_level_div in category_2_level_divs:
          category_2_level_name: str = self._execute(self._get_text_from_element, '', '.catalog-block__title', category_2_level_div).strip()
          if len(category_2_level_name) > 0:
            category_2_level: Category2Level = Category2Level(category_2_level_name, [])
            categories_3_level_divs: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.catalog-block__item', category_2_level_div)

            for categories_3_level_div in categories_3_level_divs:
              category_3_level_name: str = self._execute(self._get_text_from_prop, '', categories_3_level_div).strip()

              if len(category_3_level_name) > 0:      
                category_3_level_link: str = self._execute(self._get_attribute_from_prop, '', categories_3_level_div, 'href')
                self.__category_3_level_links.add(category_3_level_link)

                category_3_level: Category3Level = Category3Level(category_3_level_name, [])
                category_2_level.categories3Level.append(category_3_level)
              # print(4, category_1_level_name, category_2_level_name, category_3_level_name)

            category_1_level.categories2Level.append(category_2_level)
        categories_1_level.append(category_1_level)

    return categories_1_level  

  def scrape(self) -> list[Category1Level]:
    """ Скрепинг категорий 1 уровня

    Returns:
      list[Category1Level]: список категорий 1 уровня
    """
    
    self._init_driver()
    self._driver.get(URL)
    self.__open_catalog_popup()
    categories_1_level: list[Category1Level] = self.__get_categories_1_level()
    # print(self.__categories_1_level)
    self._wait(3)
    self.__set_filters(categories_1_level)
    # print(self.__categories_1_level)
    print(1, self.__products_map)
    
    self._driver.quit()

    return categories_1_level
