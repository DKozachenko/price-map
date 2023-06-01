using StackExchange.Redis;

namespace Services;
/// <summary>
/// Сервис взаимодействия с Redis
/// </summary>
class RedisService {
  /// <summary>
  /// Соединение
  /// </summary>
  public ConnectionMultiplexer connection { get; set; }
  /// <summary>
  /// Сервер
  /// </summary>
  public IServer server { get; set; }
  /// <summary>
  /// База данных
  /// </summary>
  public IDatabase db { get; set; }
  /// <summary>
  /// JSON сервис
  /// </summary>
  public JsonService JsonService { get; set; }
  /// <summary>
  /// Логер
  /// </summary>
  public LoggerService LoggerService { get; set; }

  public RedisService() {
    this.JsonService = new JsonService();
    this.LoggerService = new LoggerService();
  }

  // <summary>
  /// Инициализация соединения
  /// </summary>
  public void InitConnection() {
    ConfigurationOptions options = ConfigurationOptions.Parse("localhost:6379");
    options.ConnectRetry = 3;
    options.AllowAdmin = true;
    options.ConnectTimeout = 1500000;

    this.connection = ConnectionMultiplexer.Connect(options);
    this.server = this.connection.GetServer("localhost", 6379);
    // При инициализациия удаление всех ключей из базы (можно удалить, чтобы они сохранялись при перезапусках сервиса)
    this.server.FlushDatabase();
    this.db = this.connection.GetDatabase(); 
  }

  /// <summary>
  /// Установка значения (предполагает JSON)
  /// </summary>
  /// <param name="key">Ключ</param>
  /// <param name="data">Данные</param>
  /// <typeparam name="T">Тип данных</typeparam>
  public void set<T>(string key, T data) {
    string dataStr = this.JsonService.SerializeToString<T>(data);
    bool wasSet = db.StringSet(key, dataStr);

    if (wasSet) {
      this.LoggerService.Log($"Set up value by key: '{key}'", "RedisService");
    } else {
      this.LoggerService.Log($"Value by key: '{key}' was not set", "RedisService");
    }
  }

  /// <summary>
  /// Получение данных по ключу
  /// </summary>
  /// <param name="key">Ключ</param>
  /// <typeparam name="T">Тип данных</typeparam>
  /// <returns>Данные (предполагает JSON)</returns>
  public T? get<T>(string key) {
    string? dataStr = this.db.StringGet(key);

    if (dataStr == null) {
      this.LoggerService.Log($"No cached value by key: {key}", "RedisService");
      return default(T);
    }

    T? data = this.JsonService.DeserializeFromString<T>(dataStr);

    this.LoggerService.Log($"Gotten cached value by key: {key}", "RedisService");
    return data;
  }
}
