namespace AppNS;

/// <summary>
/// Конфигурационный файл
/// </summary>
static class Config {
  /// <summary>
  /// Путь до файла с точками
  /// </summary>
  public const string DataPath = "./data/nodes_nsk_not_water.json";
  /// <summary>
  /// Максимальное количество точек для выбора при генерации рандомных точек
  /// </summary>
  public const int MaxNodesNumber = 100;
  /// <summary>
  /// Название обменника
  /// </summary>
  public const string OsmRequesterExchange = "overpass-requester-exchange";
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
  /// <summary>
  /// Название очереди для запроса инцормации о здании
  /// </summary>
  public const string BuildingInfoRequestQueue = "building_info_request_queue";
  /// <summary>
  /// Название ключа маршрутизации для отправки информации о здании
  /// </summary>
  public const string BuildingInfoResponseRoutingKey = "building_info_response";
}
