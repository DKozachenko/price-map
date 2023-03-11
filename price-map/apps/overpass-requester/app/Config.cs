namespace AppNS;

/// <summary>
/// Конфигурационный файл
/// </summary>
static class Config {
  /// <summary>
  /// Путь до файла с точками
  /// </summary>
  public const string DataPath = "./data/nodes_nsk.json";
  /// <summary>
  /// Максимальное количество точек для выбора при генерации рандомных точек
  /// </summary>
  public const int MaxNodesNumber = 25;
  /// <summary>
  /// Название обменника
  /// </summary>
  public const string OsmRequesterExchange = "osrm-requester-exchange";
  /// <summary>
  /// Название ключа маршрутизации для магазинов
  /// </summary>
  public const string ShopsInRoutingKey = "shops_in";
  /// <summary>
  /// Название очереди для сопоставления товаров и названий магазинов
  /// </summary>
  public const string ProductsOutQueue = "products_out_queue";
  /// <summary>
  /// Таймаут для запросов в Overpass API
  /// </summary>
  public const int OverpassTimeout = 60;
} 