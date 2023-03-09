namespace Services;

class HttpService {
  private HttpClient httpClient;
  private JsonService jsonService;

  public HttpClient HttpClient { get { return this.httpClient; } set { this.httpClient = value; } }
  public JsonService JsonService { get { return this.jsonService; } set { this.jsonService = value; } }

  public HttpService() {
    this.HttpClient = new HttpClient();
    this.JsonService = new JsonService();
  }

  public async Task<T> Get<T>(string url) {
    using HttpResponseMessage response = await this.HttpClient.GetAsync(url);
    string content = await response.Content.ReadAsStringAsync();
    T result = this.JsonService.DeserializeFromString<T>(content);
    return result;
  }

}