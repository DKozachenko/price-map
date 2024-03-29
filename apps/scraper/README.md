# scraper

Сервис-скрепер, извлекающий данные с маркетплейса.

### Стэк

* Python
* Selenium Webdriver

### Запуск

1. Установка всех пакетов 
`npm ci`
2. Запуск
`npm run start:scraper`

### Принцип работы

1. Сразу при запуске сервис начинает работу: открывает сайт по указанному адресу, начинает извлекать ссылки на категории 3 уровня.
2. Затем проходится по всем ссылкам, извлекая из шапки названия категорий 1 и 2 уровней. Может оказаться, что вложенность категорий не равна 3, скрепер такие случаи игнорирует и пропускает. Если же на странице нужная вложенность, то сервис начинает получать фильтры для каждой категории 3 уровня.
3. Попутно сервис сохраняет ссылки на товары по каждой категории 3 уровня.
4. После получения всех категорий и фильтров к ним, сервис фильтрует данные, чтобы не было пустым названий, пустых списков и тд, и потом отправляет данные в указанную ([см. Конфигурацию п.2](#конфигурация)) очередь в Rabbit.
5. После он переходит к получению товаров. Для каждого товара он получает название, путь до изображения и цену. У товара не всегда есть описание и характеристики. Также к каждому товару добавляются поля с названиями категории 3 уровня и магазина. После получения всех товаров, он фильтрует их, чтобы не было пустых названий, товаров без характеристик и тд, затем отправляет нужную ([см. Конфигурацию п.6](#конфигурация)) очередь в Rabbit.
6. Наконец сервис формирует еще один массив данных, где хранятся сопоставления id товара и названия магазинаю. После формирования также отправляет его в очередь ([см. Конфигурацию п.5](#конфигурация)) в Rabbit для последующего получения координат магазинов. Далее возвращается к п.1.

### Конфигурация

Настройки можно производить в конфигурационном классе `Config`, находящемуся по пути `./scraper/app/config.py`.

1. **url** - адрес маркетплейса
2. **categories_routing_key** - Ключ маршрутизации для отправки категорий
3. **offers_per_product** - Количество получаемых для товара предложений
4. **products_out_routing_key** - Ключ маршрутизации для отправки товаров (получение координат)
5. **products_per_category** - Количество получаемых для категории товаров
6. **products_routing_key** - Ключ маршрутизации для отправки товаров
7. **scraper_exchange** - Название обменника