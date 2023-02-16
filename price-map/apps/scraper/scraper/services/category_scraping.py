from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.wait import WebDriverWait

from models.max_get_url_attempts import MAX_GET_URL_ATTEMPTS
from models.driver_path import DRIVER_PATH
from services.base_scraping import BaseScrapingService

class CategoryScrapingService(BaseScrapingService):
  def __init__(self):
    super().__init__()
    self.__category3LevelLinks = set()
    self.__productsMap = dict()

  def __openCatalogPopup(self):
    actions = ActionChains(self._driver)

    catalogPopupButton = self._driver.find_element(By.id('catalogPopupButton'))
    actions.move_to_element(catalogPopupButton).click(catalogPopupButton).perform()

    #ожидание пока прогрузится каталог
    self._driver.wait(until.elementLocated(By.css('div[data-zone-name="catalog-content"]')), 10000)

  def __clickAllMoreSpans(self):
    moreSpans = self._driver.find_elements(By.css(
      'div[role="heading"] div div[data-auto="category"] ul[data-autotest-id="subItems"] li > span'
    ))
    for span in moreSpans:
      actions = ActionChains(self._driver)
      actions.move_to_element(span).click(span).perform()

  def __getFilters(self):
    filters = []

    filterDiv = self._driver.find_element(By.css('div[data-grabber="SearchFilters"]'))
    filterDivsBoolean = filterDiv.find_elements(By.css('div[data-filter-type="boolean"]'))
    filterDivsEnum = filterDiv.find_elements(By.css('div[data-filter-type="enum"]'))
    filterDivsRange = filterDiv.find_elements(By.css('div[data-filter-type="range"]'))

    #TODO: возможно разделить получение булек, рэнджей и енамов в разные методы
    #бульки
    for filterDivBoolean in filterDivsBoolean:
      filterBooleanName = filterDivBoolean.text

      if filterBooleanName:
        filters.push({
          name: filterBooleanName.replace('\n', ''),
          type: 'boolean'
        })

    #рэнжи
    for filterDivRange in filterDivsRange:
      filterDivRangeLegend = filterDivRange.find_element(By.css('fieldset span'))
      filterDivRangeName = filterDivRangeLegend.text
      filterDivRangeMinLabel = filterDivRange.find_element(By.css(
        'span[data-auto="filter-range-min"] label:not([for])'
      ))
      filterDivRangeMaxLabel = filterDivRange.find_element(By.css(
        'span[data-auto="filter-range-max"] label:not([for])'
      ))

      filterDivRangeMinLabelText = filterDivRangeMinLabel.text
      filterDivRangeMaxLabelText = filterDivRangeMaxLabel.text

      filterDivRangeMinValueStr = filterDivRangeMinLabelText.split(' ')[1]
      filterDivRangeMaxValueStr = filterDivRangeMaxLabelText.split(' ')[1]

      filterRangeMinValue = 0

      if filterDivRangeMinValueStr.includes(','):
        filterRangeMinValue = float(filterDivRangeMinValueStr.replace(',', '.'))
      else:
        filterRangeMinValue = float(filterDivRangeMinValueStr)

      filterRangeMaxValue = 0

      if filterDivRangeMaxValueStr.includes(','):
        filterRangeMaxValue = int(filterDivRangeMaxValueStr.replace(',', '.'))
      else:
        filterRangeMaxValue = int(filterDivRangeMaxValueStr)

      if filterDivRangeName:
        filters.push({
          name: filterDivRangeName,
          type: 'range',
          value: [
            filterRangeMinValue,
            filterRangeMaxValue
          ]
        })

    #енумки
    for filterDivEnum in filterDivsEnum:
      filterDivEnumLegend = filterDivEnum.find_element(By.css('fieldset legend'))
      filterDivEnumName = filterDivEnumLegend.text

      self._driver.implicitly_wait(1500)
      filterEnumFieldsetDivs = filterDivEnum.find_elements(By.css('fieldset > div > div'))

      for fieldsetDiv in filterEnumFieldsetDivs:
        moreSpans = fieldsetDiv.find_elements(By.css('span[tabindex="0"]'))

        for moreSpan in moreSpans:
          actions = ActionChains(self._driver)
          actions.scroll_from_origin(0, 0, 0, 0, moreSpan).perform()
          actions.move_to_element(moreSpan).click(moreSpan).perform()
          self._driver.implicitly_wait(1000)

      filterEnumValueDivs = filterDivEnum.find_elements(By.css(
        'fieldset div[data-baobab-name="FilterValue"]'
      ))
      filterValues = []

      for filterEnumValueDiv in filterEnumValueDivs:
        try:
          filterEnumValue = filterEnumValueDiv.text
          filterValues.push(filterEnumValue)
        except:
          break

      if filterDivEnumName and any(bool(value) for value in filterValues):
        filters.push({
          name: filterDivEnumName,
          type: 'enum',
          value: filterValues
        })

    return filters

  def __setFilters(self, categories1Level):
    index = 0
    attemptsToGetUrl = 0
    array = self.__category3LevelLinks
    while index < array.length and attemptsToGetUrl < MAX_GET_URL_ATTEMPTS:
      self.__setCookies()
      self._driver.get(array[index])

      self._driver.implicitly_wait(1000)

      #TODO: не у всех категорий 3 уровня сразу есть товары, у кого-то мб еще категории внутри
      try:
        breadcrumb = self._driver.find_elements(By.css('ol[itemscope] li'))
        category1LevelName = breadcrumb[0].text
        category2LevelName = breadcrumb[1].text
        category3LevelName = breadcrumb[2].text

        # category1Level = categories1Level.find((item) => item.name === category1LevelName)
        category1Level = None
        # category2Level = category1Level.categories2Level.find((item) => item.name === category2LevelName)
        category2Level = None
        # category3Level = category2Level.categories3Level.find((item) =>
        #   item.name.toLowerCase().includes(category3LevelName.toLowerCase())
        #   or category3LevelName.toLowerCase().includes(item.name.toLowerCase()))
        category3Level = None

        if category3Level:
          filters = self.__getFilters()
          category3Level.filters = filters

          #добавление ссылок на товары в этой категории
          links = []
          productBlocks = self._driver.find_elements(By.css('div[data-baobab-name="$main"]'))
          productArticles = productBlocks[0].find_elements(By.css('article'))
          count = 0

          for i in range(productArticles.length):
            if count < 5:
              productA = productArticles[i].find_element(By.css('a[data-baobab-name="title"]'))
              productLink = productA.getAttribute('href')
              links.push(productLink)

              count += 1

          self.__productsMap.set({
            category1LevelName,
            category2LevelName,
            category3LevelName
          }, links)

        index += 1
        attemptsToGetUrl = 0
      except:
        attemptsToGetUrl += 1

  def __getCategories1Level(self):
    categories1Level = []
    category1LevelLis = self._driver.find_elements(By.css('ul[role="tablist"]:first-child li'))
    #TODO: убрать count
    count = 0
    count3Level = 0
    for category1LevelLi in category1LevelLis:
      actions = ActionChains(self._driver)
      actions.move_to_element(category1LevelLi).perform()

      self.__clickAllMoreSpans()

      category1LevelA = self._driver.find_element(By.css('div[role="heading"] > a'))
      category1LevelName = category1LevelA.text

      if category1LevelName != 'Скидки' and category1LevelName != 'Ресейл' and count <= 3 and count > 2:
        category1Level = {
          name: category1LevelName,
          categories2Level: []
        }

        category2LevelDivs = self._driver.find_elements(By.css(
          'div[role="heading"] div div[data-auto="category"]'
        ))

        for category2LevelDiv in category2LevelDivs:
          category2LevelDivHeading = category2LevelDiv.find_element(By.css('div[role="heading"]'))
          #при переборе не получает элемент
          category2LevelName = category2LevelDivHeading.text
          category2Level = {
            name: category2LevelName,
            categories3Level: []
          }

          categories3LevelDivs = category2LevelDiv.find_elements(By.css(
            'ul[data-autotest-id="subItems"] li > div'
          ))

          if categories3LevelDivs:
            for categories3LevelDiv in categories3LevelDivs:
              category3LevelA = categories3LevelDiv.find_element(By.css('a'))

              if count3Level < 4:
                category3LevelLink = category3LevelA.getAttribute('href')
                self.__category3LevelLinks.add(category3LevelLink)

              category3LevelName = categories3LevelDiv.text
              category2Level.categories3Level.push({
                name: category3LevelName,
                filters: []
              })

              count3Level += 1

          category1Level.categories2Level.push(category2Level)
        categories1Level.push(category1Level)

      count += 1

    return categories1Level

  def scrape(self):
    categories1Level = []

    self._initializeDriver()

    if self._driver:
      self._driver.get('https://market.yandex.ru/')
      self._setCookies()

      #TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
      if self._isShowedCaptcha():
        self._driver.get('https://market.yandex.ru/')

      self.__openCatalogPopup()

      categories1Level = self.__getCategories1Level()
      self.__setFilters(categories1Level)

      self._driver.quit()

    return categories1Level
