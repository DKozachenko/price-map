from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webelement import WebElement
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
    self.__categories_1_level: list[Category1Level] = []
    """ Категории 1 уровня """
    self.__category_3_level_links: set[str] = set()
    """ Множество ссылок на категории 3 уровня """
    self.products_map: dict[str, list[str]] = dict()
    """ Словарь ссылок на товары определенной категориии 3 уровня """

  def __open_catalog_popup(self) -> None:
    """ Открытие попапа каталога
    """

    WebDriverWait(self._driver, timeout=3).until(EC.presence_of_element_located((By.CSS_SELECTOR, '.catalog > div > button')))
    catalog_popup_putton: WebElement = self._execute(self._get_element_by_selector, None, '.catalog > div > button')
    self._click(catalog_popup_putton)

    self._wait(2)
    #Ожидание пока прогрузится каталог
    WebDriverWait(self._driver, timeout=10).until(EC.presence_of_element_located((By.CSS_SELECTOR, '.sidebar')))

  def __click_all_more_spans(self) -> None:
    """ Клик на все кнопки "Еще"
    """

    all_more_spans: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.showmore span')
    current_more_spans: list[WebElement] = self._execute(self._filter_elements, [], lambda span: span.is_displayed() == True, all_more_spans)

    for more_span in current_more_spans:
      self._click(more_span)

  def __expand_filter(self, filter_div: WebElement) -> None:
    """ Развернуть фильтр

    Args:
      filter_div (WebElement): элемент фильтра
    """

    dropdown_content_wrap_div: WebElement = self._execute(self._get_element_by_selector, None, '.droped-content-wrap', filter_div)
    style_str: str = self._execute(self._get_attribute_from_prop, '', dropdown_content_wrap_div, 'style')
    #По стилям определение свернут ли фильтр или нет
    is_collapsed: bool = style_str.find('height: 0px') != -1

    #Если фильтр свернут, необходимо его развернуть
    if is_collapsed:
      arrow_div: WebElement = self._execute(self._get_element_by_selector, None, '.is-body-opened.closed', filter_div)
      self._click(arrow_div)
      self._wait(1)

  def __get_boolean_filters(self) -> list[Filter]:
    """ Получение логических фильтров

    Returns:
      list[Filter]: список фильтров
    """

    filters: list[Filter] = []
    filter_divs: list[WebElement] = self._execute(self._get_elements_by_selector, None, '.filter:has(.boolean-filter.filter-body)')
    filter_divs = self._execute(self._filter_elements, [], lambda div: div.is_displayed() == True, filter_divs)

    for filter_div in filter_divs:
      # self._scroll(filter_div)
      # self._wait(1)
      self.__expand_filter(filter_div)

      filter_name: str = self._execute(self._get_text_from_element, '', '.filter-title', filter_div).strip()
      filter: Filter = Filter(filter_name, 'boolean', [])
      filters.append(filter)

    return filters
  
  def __get_range_filters(self) -> list[Filter]:
    """ Получение фильтров типа диапазон

    Returns:
      list[Filter]: список фильтров
    """

    filters: list[Filter] = []
    filter_divs: list[WebElement] = self._execute(self._get_elements_by_selector, None, '.filter:has(.range-input)')
    filter_divs = self._execute(self._filter_elements, [], lambda div: div.is_displayed() == True, filter_divs)

    for filter_div in filter_divs:
      self.__expand_filter(filter_div)

      filter_name: str = self._execute(self._get_text_from_element, '', '.filter-title', filter_div).strip()
      inputs: list[WebElement] = self._execute(self._get_elements_by_selector, [], 'input', filter_div)
      min_str: str = self._execute(self._get_attribute_from_prop, '',  inputs[0], 'placeholder') 
      max_str: str = self._execute(self._get_attribute_from_prop, '', inputs[1], 'placeholder') 

      if len(min_str) > 0 and len(max_str) > 0:
        filter: Filter = Filter(filter_name, 'range', [float(min_str), float(max_str)])
        filters.append(filter)

    return filters
  
  def __get_enum_filters(self) -> list[Filter]:
    """ Получение фильтров с перечислением

    Returns:
      list[Filter]: список фильтров
    """

    filters: list[Filter] = []
    filter_divs: list[WebElement] = self._execute(self._get_elements_by_selector, None, '.filter:has(.enum-filter)')
    filter_divs = self._execute(self._filter_elements, [], lambda div: div.is_displayed() == True, filter_divs)

    for filter_div in filter_divs:
      self.__expand_filter(filter_div)

      filter_name: str = self._execute(self._get_text_from_element, '', '.filter-title', filter_div).strip()
      show_more_button_exists: bool = self._is_element_exists_by_selector('.show-more-button', filter_div)

      if show_more_button_exists:
        show_more_button: WebElement = self._execute(self._get_element_by_selector, None, '.show-more-button', filter_div)
        self._click(show_more_button)
        self._wait(1)

      values: list[str] = []
      value_spans: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.boolean-filter span', filter_div)

      for value_span in value_spans:
        #Если элемент не виден, необходимо проскроллить до него, чтобы получить значение
        if value_span.is_displayed() == False:
          self._scroll(value_span)

        value: str = self._execute(self._get_text_from_prop, '', value_span)
        values.append(value)

      if len(values) > 0:
        filter: Filter = Filter(filter_name, 'enum', values)
        filters.append(filter)

    return filters

  def __get_filters(self) -> list[Filter]:
    """ Получение фильтров

    Returns:
      list[Filter]: список фильтров
    """

    filters: list[Filter] = []
    boolean_filters: list[Filter] = self._execute(self.__get_boolean_filters, [])
    range_filters: list[Filter] = self._execute(self.__get_range_filters, [])
    enum_filters: list[Filter] = self._execute(self.__get_enum_filters, [])
    filters.extend(boolean_filters)
    filters.extend(range_filters)
    filters.extend(enum_filters)


    return filters
                
  def __add_product_links(self, category_3_level: Category3Level) -> None:
    """ Добавление ссылок на товары

    Args:
      category_3_level (Category3Level): категория 3 уровня
    """
    links: list[str] = []
    #Получение всех блоков товаров
    product_blocks_all: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.p-card:not(.product-history)')
    product_blocks: list[WebElement] = []

    #Отбор только тех блоков, у которых есть кнопка сравнения цен (в ином случае ссылка ведет сразу в магазин поставщика)
    for product_block_all in product_blocks_all:
      compare_price_btn_exists: bool = self._is_element_exists_by_selector('.btn-compare-price', product_block_all)

      if compare_price_btn_exists:
        product_blocks.append(product_block_all)

    if len(product_blocks) > 0:
      #Выбор первых 5 товаров
      product_blocks = product_blocks[:self._config.products_per_category]

      for product_block in product_blocks:
        product_link: str = self._execute(self._get_attribute_from_element, '', 'href', '.p-card__title-link', product_block)
        links.append(product_link)

      self.products_map[category_3_level.name] = links
                
  def __get_category_3_level(self, name: str) -> Category3Level:
    """ Получение категории 3 уровня и добавление к ней ссылок на товары

    Args:
      name (str): название

    Returns:
      Category3Level: категория 3 уровня
    """

    filters: list[Filter] = self._execute(self.__get_filters, [])
    category_3_level: Category3Level = Category3Level(name, filters)
    self.__add_product_links(category_3_level)   
    return category_3_level
                
  def __get_categories_1_level(self) -> list[Category1Level]:
    """ Получение категорий 1 уровня

    Returns:
      list[Category1Level]: категории 1 уровня
    """
    categories_1_level: list[Category1Level] = []

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

        found_categories_1_level: list[Category1Level] = self._execute(self._filter_elements, [], lambda item: item.name == category_1_level_name, categories_1_level)
        #Если такая категория 1 уровня нашлась
        if len(found_categories_1_level) > 0:
          category_1_level: Category1Level = found_categories_1_level[0]
          found_categories_2_level: list[Category2Level] = self._execute(self._filter_elements, [], lambda item: item.name == category_2_level_name, category_1_level.categories2Level)

          #Если такая категория 2 уровня нашлась
          if len(found_categories_2_level) > 0:
            category_2_level: Category2Level = found_categories_2_level[0]
            found_categories_3_level: list[Category3Level] = self._execute(self._filter_elements, [], lambda item: item.name == category_3_level_name, category_2_level.categories3Level)

            #Если такая категория 3 уровня не нашлась (должно выполняться всегда, тк названия категорий 3 уровня уникальны)
            if len(found_categories_3_level) == 0:
              category_3_level: Category3Level - self.__get_category_3_level(category_3_level_name)
              category_2_level.categories3Level.append(category_3_level)

          #Если такая категория 2 уровня не нашлась
          else:
            category_2_level: Category2Level = Category2Level(category_2_level_name, [])
            category_1_level.categories2Level.append(category_2_level)

            category_3_level: Category3Level = self.__get_category_3_level(category_3_level_name)
            category_2_level.categories3Level.append(category_3_level)

        #Если такая категория 1 уровня не нашлась
        else:
          category_1_level: Category1Level = Category1Level(category_1_level_name, [])
          categories_1_level.append(category_1_level)

          category_2_level: Category2Level = Category2Level(category_2_level_name, [])
          category_1_level.categories2Level.append(category_2_level)

          category_3_level: Category3Level = self.__get_category_3_level(category_3_level_name)
          category_2_level.categories3Level.append(category_3_level)

    return categories_1_level
  
  def __get_category_3_level_links(self) -> set[str]:
    """ Получение ссылок на категории 3 уровня

    Returns:
      set[str]: множество ссылок
    """
    category_3_level_links: set[str] = set()
    category_1_level_lis: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.sidebar .nav li')

    # не включается последний элемент, тк это ссылка на весь каталог
    for category_1_level_li in category_1_level_lis[:-1]:
      self._hover(category_1_level_li)
      self.__click_all_more_spans()
      self._wait(1)

      category_1_level_names_all: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.catalog-title')
      current_category_1_level_name: WebElement = self._execute(self._filter_elements, [''], lambda div: div.is_displayed() == True, category_1_level_names_all)[0]
      category_1_level_name: str = self._execute(self._get_text_from_prop, '', current_category_1_level_name).capitalize().strip()

      if (len(category_1_level_name) > 0):
        category_2_level_divs_all: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.catalog-block')
        category_2_level_divs: list[WebElement] = self._execute(self._filter_elements, [], lambda div: div.is_displayed() == True, category_2_level_divs_all)

        for category_2_level_div in category_2_level_divs:
          category_2_level_name: str = self._execute(self._get_text_from_element, '', '.catalog-block__title', category_2_level_div).strip()
          if len(category_2_level_name) > 0:
            categories_3_level_divs: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.catalog-block__item', category_2_level_div)

            for categories_3_level_div in categories_3_level_divs:
              category_3_level_name: str = self._execute(self._get_text_from_prop, '', categories_3_level_div).strip()

              if len(category_3_level_name) > 0:      
                category_3_level_link: str = self._execute(self._get_attribute_from_prop, '', categories_3_level_div, 'href')
                category_3_level_links.add(category_3_level_link)

    return category_3_level_links
  
  def __scrape(self) -> list[Category1Level]:
    """ Скрепинг категорий 1 уровня (вместе со вложенными категориями 2 и 3 уровней)

    Returns:
      list[Category1Level]: список категорий 1 уровня
    """
    
    self._init_driver()
    self._driver.get(self._config.url)
    self.__open_catalog_popup()
    self.__category_3_level_links = self.__get_category_3_level_links()
    self._wait(3)
    self.__categories_1_level = self.__get_categories_1_level()
    self._driver.quit()

    return self.__categories_1_level

  def scrape(self) -> list[Category1Level]:
    """ Скрепинг категорий 1 уровня (публичное API)

    Returns:
      list[Category1Level]: список категорий 1 уровня
    """

    result: list[Category1Level] = self._execute(self.__scrape, [])
    return result
