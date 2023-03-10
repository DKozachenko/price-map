/// <summary>
/// Класс констант
/// </summary>
static class Constants {
  /// <summary>
  /// Путь до файла с точками
  /// </summary>
  public const string DataPath = "./data/nodes_nsk.json";
  /// <summary>
  /// Максимальное количество точек для выбора при генерации рандомной точки
  /// </summary>
  public const int MaxNodesNumber = 25;
  /// <summary>
  /// Название обменника для сервиса
  /// </summary>
  public const string OsmRequesterExchange = "osrm-requester-exchange";
  /// <summary>
  /// Название ключа маршрутизации для магазинов
  /// </summary>
  public const string ShopsInRoutingKey = "shops_in";
  /// <summary>
  /// Название очереди для споставления товаров и названий магазинов
  /// </summary>
  public const string ProductsOutQueue = "products_out_queue";
  /// <summary>
  /// Таймаут для запросов в Overpass API
  /// </summary>
  public const int OverpassTimeout = 60;
} 