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

class CategoryScrapingService(BaseScrapingService):
  """ Сервис-скрепер категорий

  Args:
    BaseScrapingService (_type_): наследуется от BaseScrapingService
  """

  def __init__(self) -> None:
    super().__init__()
    self.__category_3_level_links: set[str] = set()
    self.__products_map: dict[str, list[str]] = dict()
    self.__categories_1_level: list[Category1Level] = []

  def __open_catalog_popup(self) -> None:
    """ Открытие попапа каталога
    """

    WebDriverWait(self._driver, timeout=3).until(EC.presence_of_element_located((By.ID, 'catalogPopupButton')))
    catalog_popup_putton: WebElement = self._execute(self._get_element_by_id, None, 'catalogPopupButton')
    self._execute_void(self._click, catalog_popup_putton)

    #ожидание пока прогрузится каталог
    WebDriverWait(self._driver, timeout=10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[data-zone-name="catalog-content"]')))

  def __click_all_more_spans(self) -> None:
    """ Клик на все кнопки "Еще"
    """

    more_spans: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'div[role="heading"] div div[data-auto="category"] ul[data-autotest-id="subItems"] li > span')

    for more_span in more_spans:
      self._execute_void(self._click, more_span)

  def __get_boolean_filters(self, filter_div: WebElement) -> list[Filter]:
    """ Получение фильтров с булевым значением

    Args:
      filter_div (WebElement): элемент фильтра

    Returns:
      list[Filter]: список фильтров
    """

    boolean_filters: list[Filter] = []
    filter_divs_boolean: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'div[data-filter-type="boolean"]', filter_div)

    for filter_div_boolean in filter_divs_boolean:
      filter_boolean_name: str = self._execute(self._get_text_from_prop, '', filter_div_boolean)
      filter: Filter = Filter(filter_boolean_name.replace('\n', ''), 'boolean', [])
      boolean_filters.append(filter)

    return boolean_filters

  def __get_range_filters(self, filter_div: WebElement) -> list[Filter]:
    """ Получение фильтров с диапазоном

    Args:
      filter_div (WebElement): элемент фильтра

    Returns:
      list[Filter]: список фильтров
    """

    range_filters: list[Filter] = []
    filter_divs_range: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'div[data-filter-type="range"]', filter_div)

    for filter_div_range in filter_divs_range:
      filter_div_range_name: str = self._execute(self._get_text_from_element, '', 'fieldset span', filter_div_range)
      filter_div_range_min_label_text: str = self._execute(self._get_text_from_element, '', 'span[data-auto="filter-range-min"] label:not([for])', filter_div_range)
      filter_div_range_max_label_text: str = self._execute(self._get_text_from_element, '', 'span[data-auto="filter-range-max"] label:not([for])', filter_div_range)

      filter_div_range_min_value_str: str = filter_div_range_min_label_text.split(' ')[1]
      filter_div_range_max_value_str: str = filter_div_range_max_label_text.split(' ')[1]

      filter_range_min_value: int | float = 0

      if ',' in filter_div_range_min_value_str:
        filter_range_min_value = float(filter_div_range_min_value_str.replace(',', '.'))
      else:
        filter_range_min_value = int(filter_div_range_min_value_str)

      filter_range_max_value: int | float = 0

      # ПОДУМАТЬ ПРО ГОВНО-ТЕРНАРЬ
      if ',' in filter_div_range_max_value_str:
        filter_range_max_value = float(filter_div_range_max_value_str.replace(',', '.'))
      else:
        filter_range_max_value = int(filter_div_range_max_value_str)

      if filter_div_range_name:
        filter: Filter = Filter(filter_div_range_name, 'range', [filter_range_min_value, filter_range_max_value])
        range_filters.append(filter)

    return range_filters

  def __get_enum_filters(self, filter_div: WebElement) -> list[Filter]:
    """ Получение фильтров с перечислением значений

    Args:
      filter_div (WebElement): элемент фильтра

    Returns:
      list[Filter]: список фильтров
    """

    enum_filters: list[Filter] = []
    filter_divs_enum: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'div[data-filter-type="enum"]', filter_div)

    for filter_div_enum in filter_divs_enum:
      filter_div_enum_name: str = self._execute(self._get_text_from_element, '', 'fieldset legend', filter_div_enum)

      self._wait(2)
      filter_enum_fieldset_divs: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'fieldset > div > div', filter_div_enum)

      for fieldsetDiv in filter_enum_fieldset_divs:
        more_spans: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'span[tabindex="0"]', fieldsetDiv)

        for more_span in more_spans:
          self._execute_void(self._scroll_and_click, more_span)
          self._wait(1)

      filter_enum_value_divs: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'fieldset div[data-baobab-name="FilterValue"]', filter_div_enum)
      filter_values: list[str] = []

      for filter_enum_value_div in filter_enum_value_divs:
        filter_enum_value: str = self._execute(self._get_text_from_prop, '', filter_enum_value_div)
        filter_values.append(filter_enum_value)

      if filter_div_enum_name and any(bool(value) for value in filter_values):
        filter: Filter = Filter(filter_div_enum_name, 'enum', filter_values)
        enum_filters.append(filter)

    return enum_filters


  def __get_filters(self) -> list[Filter]:
    """ Получение фильтров

    Returns:
      list[Filter]: список фильтров
    """

    filters: list[Filter] = []
    filter_div: WebElement = self._execute(self._get_element_by_selector, None, 'div[data-grabber="SearchFilters"]')

    boolean_filters: list[Filter] = self._execute(self.__get_boolean_filters, [], filter_div)
    range_filters: list[Filter] = self._execute(self.__get_range_filters, [], filter_div)
    enum_filters: list[Filter] = self._execute(self.__get_enum_filters, [], filter_div)
    filters.extend(boolean_filters)
    filters.extend(range_filters)
    filters.extend(enum_filters)

    return filters

  def __set_filters(self) -> None:
    """ Установка фильтров
    """

    index: int = 0
    array: list[str] = list(self.__category_3_level_links)

    while index < len(array):
      self._driver.get(array[index])
      self._wait(2)

      #TODO: не у всех категорий 3 уровня сразу есть товары, у кого-то мб еще категории внутри
      breadcrumb: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'ol[itemscope] li')
      print(breadcrumb)
      if len(breadcrumb) == 3:
        category_1_level_name: str = self._execute(self._get_text_from_prop, '', breadcrumb[0])
        category_2_level_name: str = self._execute(self._get_text_from_prop, '', breadcrumb[1])
        category_3_level_name: str = self._execute(self._get_text_from_prop, '', breadcrumb[2])
        print(category_1_level_name, category_2_level_name, category_3_level_name)

        found_categories_1_level = list(filter(lambda item: item.name == category_1_level_name, self.__categories_1_level))

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

              if category_3_level:
                filters: list[Filter] = self._execute(self.__get_filters, [])
                category_3_level.filters = filters

                #добавление ссылок на товары в этой категории
                links: list[str] = []
                product_blocks: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'div[data-baobab-name="$main"]')
                if len(product_blocks) > 0:  
                  product_articles: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'article', product_blocks[0])
                  count: int = 0

                  for i in range(len(product_articles)):
                    if count < 5:
                      product_link: str = self._execute(self._get_attribute_from_element, '', 'href', 'a[data-baobab-name="title"]', product_articles[i])
                      links.append(product_link)

                      count += 1

                  self.__products_map[category_3_level.name] = links

        index += 1

  def __fill_categories_1_level(self) -> None:
    """ Заполнение категорий 1 уровня
    """

    category_1_level_lis: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'ul[role="tablist"]:first-child li')
    #TODO: убрать count
    count: int = 0
    count_3_level: int = 0

    for category_1_level_li in category_1_level_lis:
      self._execute_void(self._hover, category_1_level_li)

      self._execute_void(self.__click_all_more_spans)
      self._wait(2)
      # WebDriverWait(self._driver, timeout=3).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[role="heading"] > a')))
      category_1_level_name: str = self._execute(self._get_text_from_element, '', 'div[role="heading"] > a')

      if category_1_level_name != 'Скидки' and category_1_level_name != 'Ресейл':
        category_1_level: Category1Level = Category1Level(category_1_level_name, [])

        category_2_level_divs: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'div[role="heading"] div div[data-auto="category"]')

        for category_2_level_div in category_2_level_divs:
          #при переборе не получает элемент
          category_2_level_name: str = self._execute(self._get_text_from_element, '', 'div[role="heading"', category_2_level_div)
          category_2_level: Category2Level = Category2Level(category_2_level_name, [])

          categories_3_level_divs: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'ul[data-autotest-id="subItems"] li > div', category_2_level_div)

          for categories_3_level_div in categories_3_level_divs:
            # if count_3_level < 4:
            category_3_level_link: str = self._execute(self._get_attribute_from_element, '', 'href', 'a', categories_3_level_div)
            self.__category_3_level_links.add(category_3_level_link)

            category_3_level_name: str = self._execute(self._get_text_from_prop, '', categories_3_level_div)
            category_3_level: Category3Level = Category3Level(category_3_level_name, [])
            category_2_level.categories3Level.append(category_3_level)

            count_3_level += 1

          category_1_level.categories2Level.append(category_2_level)
        self.__categories_1_level.append(category_1_level)

      count += 1

  def scrape(self) -> list[Category1Level]:
    """ Скрепинг категорий 1 уровня

    Returns:
      list[Category1Level]: список категорий 1 уровня
    """

    self._init_driver()
    self._driver.get(URL)
    self._wait(100)
    # self._set_cookies()

    #TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
    # if self._is_showed_captcha():
    #   self._driver.get(URL)

    self.__open_catalog_popup()
    # self.__fill_categories_1_level()
    # print(self.__categories_1_level)
    self._wait(10)
    # self.__set_filters()
    # print(self.__categories_1_level)
    # print(1, self.__products_map)
    
    self._driver.quit()

    return self.__categories_1_level
