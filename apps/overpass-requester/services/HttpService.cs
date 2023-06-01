namespace Services;

/// <summary>
/// Сервис отправки HTTP-запросов
/// </summary>
class HttpService {
  /// <summary>
  /// HTTP-клиент
  /// </summary>
  public HttpClient HttpClient { get; set; }
  /// <summary>
  /// JSON сервис
  /// </summary>
  public JsonService JsonService { get; set; }
  /// <summary>
  /// Логгер
  /// </summary>
  public LoggerService LoggerService { get; set; }

  public HttpService() {
    this.HttpClient = new HttpClient();
    this.JsonService = new JsonService();
    this.LoggerService = new LoggerService();
  }

  /// <summary>
  /// Отправка GET запроса
  /// </summary>
  /// <param name="url">Адрес</param>
  /// <typeparam name="T">Тип возвращаемых данных</typeparam>
  /// <returns>Данные T типа</returns>
  public async Task<T?> Get<T>(string url) {
    this.LoggerService.Log($"Request to {url}", "HttpService");
    using HttpResponseMessage response = await this.HttpClient.GetAsync(url);
    string content = await response.Content.ReadAsStringAsync();
    T? result = this.JsonService.DeserializeFromString<T>(content);
    return result;
  }

}