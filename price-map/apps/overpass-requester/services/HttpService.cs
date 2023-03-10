namespace Services;

class HttpService {
  private HttpClient httpClient;
  private JsonService jsonService;
  private LoggerService loggerService;

  public HttpClient HttpClient { get { return this.httpClient; } set { this.httpClient = value; } }
  public JsonService JsonService { get { return this.jsonService; } set { this.jsonService = value; } }
  public LoggerService LoggerService { get { return this.loggerService; } set { this.loggerService = value; } }

  public HttpService() {
    this.HttpClient = new HttpClient();
    this.JsonService = new JsonService();
    this.LoggerService = new LoggerService();
  }

  public async Task<T> Get<T>(string url) {
    this.LoggerService.Log($"Current thread name {Thread.CurrentThread.Name}, id {Thread.CurrentThread.ManagedThreadId}", "HttpService");
    this.LoggerService.Log($"Request to {url}", "HttpService");
    using HttpResponseMessage response = await this.HttpClient.GetAsync(url);
    string content = await response.Content.ReadAsStringAsync();
    T result = this.JsonService.DeserializeFromString<T>(content);
    return result;
  }

}