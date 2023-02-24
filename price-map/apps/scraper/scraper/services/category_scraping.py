import time
from typing import Any, Union
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webelement import WebElement

from constants.max_get_url_attempts import MAX_GET_URL_ATTEMPTS
from services.base_scraping import BaseScrapingService

class CategoryScrapingService(BaseScrapingService):
  def __init__(self) -> None:
    super().__init__()
    self.__category_3_level_links: set[str] = set()
    self.__products_map: dict[str, list[str]] = dict()

  def __open_catalog_popup(self) -> None:
    # time.sleep(10000000)
    actions: ActionChains = ActionChains(self._driver)

    WebDriverWait(self._driver, timeout=3).until(EC.presence_of_element_located((By.ID, 'catalogPopupButton')))
    catalog_popup_putton: WebElement = self._driver.find_element(By.ID, 'catalogPopupButton')
    actions.move_to_element(catalog_popup_putton).click(catalog_popup_putton).perform()

    #ожидание пока прогрузится каталог
    WebDriverWait(self._driver, timeout=10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[data-zone-name="catalog-content"]')))

  def __click_all_more_spans(self) -> None:
    try:
      more_spans: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 
        'div[role="heading"] div div[data-auto="category"] ul[data-autotest-id="subItems"] li > span'
      )
      for more_span in more_spans:
        actions: ActionChains = ActionChains(self._driver)
        actions.move_to_element(more_span).click(more_span).perform()
    except:
      pass
    

  def __get_filters(self) -> list[dict[str, Any]]:
    filters: list[dict[str, Any]] = []

    filter_div: WebElement = self._driver.find_element(By.CSS_SELECTOR, 'div[data-grabber="SearchFilters"]')
    filter_divs_boolean: list[WebElement] = filter_div.find_elements(By.CSS_SELECTOR, 'div[data-filter-type="boolean"]')
    filter_divs_enum: list[WebElement] = filter_div.find_elements(By.CSS_SELECTOR, 'div[data-filter-type="enum"]')
    filter_divs_range: list[WebElement] = filter_div.find_elements(By.CSS_SELECTOR, 'div[data-filter-type="range"]')

    #TODO: возможно разделить получение булек, рэнджей и енамов в разные методы
    #бульки
    for filter_div_boolean in filter_divs_boolean:
      filter_boolean_name: str = filter_div_boolean.text

      if filter_boolean_name:
        filters.append({
          "name": filter_boolean_name.replace('\n', ''),
          "type": 'boolean'
        })

    #рэнжи
    for filter_div_range in filter_divs_range:
      filter_div_range_legend: WebElement = filter_div_range.find_element(By.CSS_SELECTOR, 'fieldset span')
      filter_div_range_name: str = filter_div_range_legend.text
      filter_div_range_min_label: WebElement = filter_div_range.find_element(By.CSS_SELECTOR, 
        'span[data-auto="filter-range-min"] label:not([for])'
      )
      filter_div_range_max_label: WebElement = filter_div_range.find_element(By.CSS_SELECTOR,
        'span[data-auto="filter-range-max"] label:not([for])'
      )

      filter_div_range_min_label_text: str = filter_div_range_min_label.text
      filter_div_range_max_label_text: str = filter_div_range_max_label.text

      filter_div_range_min_value_str: str = filter_div_range_min_label_text.split(' ')[1]
      filter_div_range_max_value_str: str = filter_div_range_max_label_text.split(' ')[1]

      filter_range_min_value: Union[int, float] = 0

      if ',' in filter_div_range_min_value_str:
        filter_range_min_value = float(filter_div_range_min_value_str.replace(',', '.'))
      else:
        filter_range_min_value = int(filter_div_range_min_value_str)

      filter_range_max_value: Union[int, float] = 0

      if ',' in filter_div_range_max_value_str:
        filter_range_max_value = float(filter_div_range_max_value_str.replace(',', '.'))
      else:
        filter_range_max_value = int(filter_div_range_max_value_str)

      if filter_div_range_name:
        filters.append({
          "name": filter_div_range_name,
          "type": 'range',
          "value": [
            filter_range_min_value,
            filter_range_max_value
          ]
        })

    #енумки
    for filter_div_enum in filter_divs_enum:
      filter_div_enum_legend: WebElement = filter_div_enum.find_element(By.CSS_SELECTOR, 'fieldset legend')
      filter_div_enum_name: str = filter_div_enum_legend.text

      self._driver.implicitly_wait(2)
      filter_enum_fieldset_divs: list[WebElement] = filter_div_enum.find_elements(By.CSS_SELECTOR, 'fieldset > div > div')

      for fieldsetDiv in filter_enum_fieldset_divs:
        more_spans: list[WebElement] = fieldsetDiv.find_elements(By.CSS_SELECTOR, 'span[tabindex="0"]')

        for more_span in more_spans:
          actions: ActionChains = ActionChains(self._driver)
          actions.scroll_from_origin(0, 0, 0, 0, more_span).perform()
          actions.move_to_element(more_span).click(more_span).perform()
          self._driver.implicitly_wait(1000)

      filter_enum_value_divs: list[WebElement] = filter_div_enum.find_elements(By.CSS_SELECTOR,
        'fieldset div[data-baobab-name="FilterValue"]'
      )
      filter_values: list[str] = []

      for filter_enum_value_div in filter_enum_value_divs:
        try:
          filter_enum_value: str = filter_enum_value_div.text
          filter_values.append(filter_enum_value)
        except:
          break

      if filter_div_enum_name and any(bool(value) for value in filter_values):
        filters.append({
          "name": filter_div_enum_name,
          "type": 'enum',
          "value": filter_values
        })

    return filters

  def __set_filters(self, categories_1_level: list[Any]) -> None:
    index: int = 0
    attempts_to_get_url: int = 0
    array: list[str] = list(self.__category_3_level_links)
    while index < len(array) and attempts_to_get_url < MAX_GET_URL_ATTEMPTS:
      # self._set_cookies()
      # print('set up')
      self._driver.get(array[index])
      # print('get by id')
      self._driver.implicitly_wait(10)

      #TODO: не у всех категорий 3 уровня сразу есть товары, у кого-то мб еще категории внутри
      try:
        breadcrumb: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'ol[itemscope] li')
        print(breadcrumb)
        category_1_level_name: str = breadcrumb[0].text
        category_2_level_name: str = breadcrumb[1].text
        category_3_level_name: str = breadcrumb[2].text
        print(category_1_level_name, category_2_level_name, category_3_level_name)
        category_1_level: Any = list(filter(lambda item: item['name'] == category_1_level_name, categories_1_level))[0]

        # print(123, category_1_level)
        category_2_level: Any = list(filter(lambda item: item['name'] == category_2_level_name, list(category_1_level['categories2Level'])))[0]
        # print(456, category2Level)
        category_3_level: Any = list(filter(lambda item: category_3_level_name.lower() in item['name'].lower()
          or item['name'].lower() in category_3_level_name.lower(), category_2_level['categories3Level']))[0]
        # print(789, category3Level)

        if category_3_level:
          filters: list[dict[str, Any]] = self.__get_filters()
          category_3_level['filters'] = filters

          #добавление ссылок на товары в этой категории
          links: list[str] = []
          product_blocks: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'div[data-baobab-name="$main"]')
          product_articles: list[WebElement] = product_blocks[0].find_elements(By.CSS_SELECTOR, 'article')
          count: int = 0

          for i in range(len(product_articles)):
            if count < 5:
              product_a: WebElement = product_articles[i].find_element(By.CSS_SELECTOR, 'a[data-baobab-name="title"]')
              product_link: str = product_a.get_attribute('href')
              links.append(product_link)

              count += 1

          # self.__products_map.update({ {
          #   category1LevelName: category1LevelName,
          #   category2LevelName: category2LevelName,
          #   category3LevelName: category3LevelName
          # }: links })

          self.__products_map[category_3_level['name']] = links

        index += 1
        attempts_to_get_url = 0
      except:
        print('IN EXCEPT')
        attempts_to_get_url += 1

  def __get_categories_1_level(self) -> list[Any]:
    categories_1_level: list[Any] = []
    category_1_level_lis: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'ul[role="tablist"]:first-child li')
    #TODO: убрать count
    count: int = 0
    count_3_level: int = 0
    for category_1_level_li in category_1_level_lis:
      actions: ActionChains = ActionChains(self._driver)
      actions.move_to_element(category_1_level_li).perform()

      self.__click_all_more_spans()
      self._driver.implicitly_wait(3)
      # WebDriverWait(self._driver, timeout=3).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[role="heading"] > a')))
      category_1_level_a: WebElement = self._driver.find_element(By.CSS_SELECTOR, 'div[role="heading"] > a')
      category_1_level_name: str = category_1_level_a.text

      if category_1_level_name != 'Скидки' and category_1_level_name != 'Ресейл' and count <= 3 and count > 2:
        category_1_level: dict[str, Any] = {
          "name": category_1_level_name,
          "categories2Level": []
        }

        category_2_level_divs: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR,
          'div[role="heading"] div div[data-auto="category"]'
        )

        for category_2_level_div in category_2_level_divs:
          # self._driver.implicitly_wait(3)
          category_2_level_div_heading: WebElement = category_2_level_div.find_element(By.CSS_SELECTOR, 'div[role="heading"]')
          #при переборе не получает элемент
          category_2_level_name: str = category_2_level_div_heading.text
          category_2_level: dict[str, Any] = {
            "name": category_2_level_name,
            "categories3Level": []
          }

          categories_3_level_divs: list[WebElement] = category_2_level_div.find_elements(By.CSS_SELECTOR,
            'ul[data-autotest-id="subItems"] li > div'
          )

          if categories_3_level_divs:
            for categories_3_level_div in categories_3_level_divs:
              # self._driver.implicitly_wait(3)
              category_3_level_a: WebElement = categories_3_level_div.find_element(By.CSS_SELECTOR, 'a')

              if count_3_level < 4:
                category_3_level_link: str = category_3_level_a.get_attribute('href')
                self.__category_3_level_links.add(category_3_level_link)

              category_3_level_name: str = categories_3_level_div.text
              category_2_level['categories3Level'].append({
                "name": category_3_level_name,
                "filters": []
              })

              count_3_level += 1

          category_1_level['categories2Level'].append(category_2_level)
        categories_1_level.append(category_1_level)

      count += 1

    return categories_1_level

  def scrape(self) -> list[Any]:
    categories_1_level: list[Any] = []

    self._init_driver()

    if self._driver:
      self._driver.get('https://market.yandex.ru/')
      self._set_cookies()     

      #TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
      if self._is_showed_captcha():
        # captcha = self._driver.find_element(By.CSS_SELECTOR, '.CheckboxCaptcha-Button')
        # captcha.click()
        actions: ActionChains = ActionChains(self._driver)
        # actions.click(captcha).perform()
        # self._set_cookies()
        self._driver.get('https://market.yandex.ru/')

      self.__open_catalog_popup()

      categories_1_level = self.__get_categories_1_level()
      self.__set_filters(categories_1_level)
      print(categories_1_level)
      print(1, self.__products_map)

      self._driver.quit()

    return categories_1_level
