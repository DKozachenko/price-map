import time
from typing import Any, Union
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webelement import WebElement

from models.max_get_url_attempts import MAX_GET_URL_ATTEMPTS
from services.base_scraping import BaseScrapingService

class CategoryScrapingService(BaseScrapingService):
  def __init__(self) -> None:
    super().__init__()
    self.__category3LevelLinks: set[str] = set()
    self.__productsMap: dict[str, list[str]] = dict()

  def __openCatalogPopup(self) -> None:
    # time.sleep(10000000)
    actions: ActionChains = ActionChains(self._driver)

    WebDriverWait(self._driver, timeout=3).until(EC.presence_of_element_located((By.ID, 'catalogPopupButton')))
    catalogPopupButton: WebElement = self._driver.find_element(By.ID, 'catalogPopupButton')
    actions.move_to_element(catalogPopupButton).click(catalogPopupButton).perform()

    #ожидание пока прогрузится каталог
    WebDriverWait(self._driver, timeout=10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[data-zone-name="catalog-content"]')))

  def __clickAllMoreSpans(self) -> None:
    try:
      moreSpans: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 
        'div[role="heading"] div div[data-auto="category"] ul[data-autotest-id="subItems"] li > span'
      )
      for span in moreSpans:
        actions: ActionChains = ActionChains(self._driver)
        actions.move_to_element(span).click(span).perform()
    except:
      pass
    

  def __getFilters(self) -> list[dict[str, Any]]:
    filters: list[dict[str, Any]] = []

    filterDiv: WebElement = self._driver.find_element(By.CSS_SELECTOR, 'div[data-grabber="SearchFilters"]')
    filterDivsBoolean: list[WebElement] = filterDiv.find_elements(By.CSS_SELECTOR, 'div[data-filter-type="boolean"]')
    filterDivsEnum: list[WebElement] = filterDiv.find_elements(By.CSS_SELECTOR, 'div[data-filter-type="enum"]')
    filterDivsRange: list[WebElement] = filterDiv.find_elements(By.CSS_SELECTOR, 'div[data-filter-type="range"]')

    #TODO: возможно разделить получение булек, рэнджей и енамов в разные методы
    #бульки
    for filterDivBoolean in filterDivsBoolean:
      filterBooleanName: str = filterDivBoolean.text

      if filterBooleanName:
        filters.append({
          "name": filterBooleanName.replace('\n', ''),
          "type": 'boolean'
        })

    #рэнжи
    for filterDivRange in filterDivsRange:
      filterDivRangeLegend: WebElement = filterDivRange.find_element(By.CSS_SELECTOR, 'fieldset span')
      filterDivRangeName: str = filterDivRangeLegend.text
      filterDivRangeMinLabel: WebElement = filterDivRange.find_element(By.CSS_SELECTOR, 
        'span[data-auto="filter-range-min"] label:not([for])'
      )
      filterDivRangeMaxLabel: WebElement = filterDivRange.find_element(By.CSS_SELECTOR,
        'span[data-auto="filter-range-max"] label:not([for])'
      )

      filterDivRangeMinLabelText: str = filterDivRangeMinLabel.text
      filterDivRangeMaxLabelText: str = filterDivRangeMaxLabel.text

      filterDivRangeMinValueStr: str = filterDivRangeMinLabelText.split(' ')[1]
      filterDivRangeMaxValueStr: str = filterDivRangeMaxLabelText.split(' ')[1]

      filterRangeMinValue: Union[int, float] = 0

      if ',' in filterDivRangeMinValueStr:
        filterRangeMinValue = float(filterDivRangeMinValueStr.replace(',', '.'))
      else:
        filterRangeMinValue = int(filterDivRangeMinValueStr)

      filterRangeMaxValue: Union[int, float] = 0

      if ',' in filterDivRangeMaxValueStr:
        filterRangeMaxValue = float(filterDivRangeMaxValueStr.replace(',', '.'))
      else:
        filterRangeMaxValue = int(filterDivRangeMaxValueStr)

      if filterDivRangeName:
        filters.append({
          "name": filterDivRangeName,
          "type": 'range',
          "value": [
            filterRangeMinValue,
            filterRangeMaxValue
          ]
        })

    #енумки
    for filterDivEnum in filterDivsEnum:
      filterDivEnumLegend: WebElement = filterDivEnum.find_element(By.CSS_SELECTOR, 'fieldset legend')
      filterDivEnumName: str = filterDivEnumLegend.text

      self._driver.implicitly_wait(2)
      filterEnumFieldsetDivs: list[WebElement] = filterDivEnum.find_elements(By.CSS_SELECTOR, 'fieldset > div > div')

      for fieldsetDiv in filterEnumFieldsetDivs:
        moreSpans: list[WebElement] = fieldsetDiv.find_elements(By.CSS_SELECTOR, 'span[tabindex="0"]')

        for moreSpan in moreSpans:
          actions: ActionChains = ActionChains(self._driver)
          actions.scroll_from_origin(0, 0, 0, 0, moreSpan).perform()
          actions.move_to_element(moreSpan).click(moreSpan).perform()
          self._driver.implicitly_wait(1000)

      filterEnumValueDivs: list[WebElement] = filterDivEnum.find_elements(By.CSS_SELECTOR,
        'fieldset div[data-baobab-name="FilterValue"]'
      )
      filterValues: list[str] = []

      for filterEnumValueDiv in filterEnumValueDivs:
        try:
          filterEnumValue: str = filterEnumValueDiv.text
          filterValues.append(filterEnumValue)
        except:
          break

      if filterDivEnumName and any(bool(value) for value in filterValues):
        filters.append({
          "name": filterDivEnumName,
          "type": 'enum',
          "value": filterValues
        })

    return filters

  def __setFilters(self, categories1Level: list[Any]) -> None:
    index: int = 0
    attemptsToGetUrl: int = 0
    array: list[str] = list(self.__category3LevelLinks)
    while index < len(array) and attemptsToGetUrl < MAX_GET_URL_ATTEMPTS:
      # self._setCookies()
      # print('set up')
      self._driver.get(array[index])
      # print('get by id')
      self._driver.implicitly_wait(10)

      #TODO: не у всех категорий 3 уровня сразу есть товары, у кого-то мб еще категории внутри
      try:
        breadcrumb: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'ol[itemscope] li')
        print(breadcrumb)
        category1LevelName: str = breadcrumb[0].text
        category2LevelName: str = breadcrumb[1].text
        category3LevelName: str = breadcrumb[2].text
        print(category1LevelName, category2LevelName, category3LevelName)
        # category1Level = categories1Level.find((item) => item.name === category1LevelName)
        category1Level: Any = list(filter(lambda item: item['name'] == category1LevelName, categories1Level))[0]
        # category1Level = None
        # for cat1 in categories1Level:
        #   if (cat1['name'] == category1LevelName):
        #     category1Level = cat1
        #     break

        # print(123, category1Level)
        # category2Level = category1Level.categories2Level.find((item) => item.name === category2LevelName)
        category2Level: Any = list(filter(lambda item: item['name'] == category2LevelName, list(category1Level['categories2Level'])))[0]
        # print(456, category2Level)
        # category3Level = category2Level.categories3Level.find((item) =>
        #   item.name.toLowerCase().includes(category3LevelName.toLowerCase())
        #   or category3LevelName.toLowerCase().includes(item.name.toLowerCase()))
        category3Level: Any = list(filter(lambda item: category3LevelName.lower() in item['name'].lower()
          or item['name'].lower() in category3LevelName.lower(), category2Level['categories3Level']))[0]
        # print(789, category3Level)

        if category3Level:
          filters: list[dict[str, Any]] = self.__getFilters()
          category3Level['filters'] = filters

          #добавление ссылок на товары в этой категории
          links: list[str] = []
          productBlocks: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'div[data-baobab-name="$main"]')
          productArticles: list[WebElement] = productBlocks[0].find_elements(By.CSS_SELECTOR, 'article')
          count: int = 0

          for i in range(len(productArticles)):
            if count < 5:
              productA: WebElement = productArticles[i].find_element(By.CSS_SELECTOR, 'a[data-baobab-name="title"]')
              productLink: str = productA.get_attribute('href')
              links.append(productLink)

              count += 1

          # self.__productsMap.update({ {
          #   category1LevelName: category1LevelName,
          #   category2LevelName: category2LevelName,
          #   category3LevelName: category3LevelName
          # }: links })

          self.__productsMap[category3Level['name']] = links

        index += 1
        attemptsToGetUrl = 0
      except:
        print('IN EXCEPT')
        attemptsToGetUrl += 1

  def __getCategories1Level(self) -> list[Any]:
    categories1Level: list[Any] = []
    category1LevelLis: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'ul[role="tablist"]:first-child li')
    #TODO: убрать count
    count: int = 0
    count3Level: int = 0
    for category1LevelLi in category1LevelLis:
      actions: ActionChains = ActionChains(self._driver)
      actions.move_to_element(category1LevelLi).perform()

      self.__clickAllMoreSpans()
      self._driver.implicitly_wait(3)
      # WebDriverWait(self._driver, timeout=3).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[role="heading"] > a')))
      category1LevelA: WebElement = self._driver.find_element(By.CSS_SELECTOR, 'div[role="heading"] > a')
      category1LevelName: str = category1LevelA.text

      if category1LevelName != 'Скидки' and category1LevelName != 'Ресейл' and count <= 3 and count > 2:
        category1Level: dict[str, Any] = {
          "name": category1LevelName,
          "categories2Level": []
        }

        category2LevelDivs: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR,
          'div[role="heading"] div div[data-auto="category"]'
        )

        for category2LevelDiv in category2LevelDivs:
          # self._driver.implicitly_wait(3)
          category2LevelDivHeading: WebElement = category2LevelDiv.find_element(By.CSS_SELECTOR, 'div[role="heading"]')
          #при переборе не получает элемент
          category2LevelName: str = category2LevelDivHeading.text
          category2Level: dict[str, Any] = {
            "name": category2LevelName,
            "categories3Level": []
          }

          categories3LevelDivs: list[WebElement] = category2LevelDiv.find_elements(By.CSS_SELECTOR,
            'ul[data-autotest-id="subItems"] li > div'
          )

          if categories3LevelDivs:
            for categories3LevelDiv in categories3LevelDivs:
              # self._driver.implicitly_wait(3)
              category3LevelA: WebElement = categories3LevelDiv.find_element(By.CSS_SELECTOR, 'a')

              if count3Level < 4:
                category3LevelLink: str = category3LevelA.get_attribute('href')
                self.__category3LevelLinks.add(category3LevelLink)

              category3LevelName: str = categories3LevelDiv.text
              category2Level['categories3Level'].append({
                "name": category3LevelName,
                "filters": []
              })

              count3Level += 1

          category1Level['categories2Level'].append(category2Level)
        categories1Level.append(category1Level)

      count += 1

    return categories1Level

  def scrape(self) -> list[Any]:
    categories1Level: list[Any] = []

    self._initializeDriver()

    if self._driver:
      self._driver.get('https://market.yandex.ru/')
      self._setCookies()     

      #TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
      if self._isShowedCaptcha():
        # captcha = self._driver.find_element(By.CSS_SELECTOR, '.CheckboxCaptcha-Button')
        # captcha.click()
        actions: ActionChains = ActionChains(self._driver)
        # actions.click(captcha).perform()
        # self._setCookies()
        self._driver.get('https://market.yandex.ru/')

      self.__openCatalogPopup()

      categories1Level: list[Any] = self.__getCategories1Level()
      self.__setFilters(categories1Level)
      print(categories1Level)
      print(1, self.__productsMap)

      self._driver.quit()

    return categories1Level
