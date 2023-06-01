# osrm-requester

Сервис, который получает информацию о маршрутах и другую различную информацию, посредством HTTP-запроса в [OSRM API](http://project-osrm.org/docs/v5.24.0/api/#).

### Стэк

* Rust

### Запуск

1. Установка всех пакетов 
`npm ci`
2. Запуск
`npm run start:osrm-requester`
Если в выходной папке **target/release** есть папка **config**, то для сборки используется команда
`npm run build:osrm-requester`, а для запуска
`npm run execute:osrm-requester`

### Принцип работы

1. Изначально сервис считывает с файла конфигурацию.
2. Далее сервис ждет сообщения из очереди ([см. Конфигурацию п.1](#конфигурация)).
3. После этого сервис делает запрос в OSRM, декодирует полилайн, формирует данные для отправки в нужном формате.
4. В конце отправляет данные в другую очередь ([см. Конфигурацию п.2](#конфигурация)). Затем возвращается к п.2, ожидая сдедующего сообщения.

### Конфигурация

Настройки можно производить в конфигурационной файле, находящемуся по пути `./src/config/config.yaml`.

1. **request-queue** - Название очереди для запроса на построение маршрута
2. **response-queue** - Название очереди для отправки построенного маршрута