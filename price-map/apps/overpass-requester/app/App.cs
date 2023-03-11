using RabbitMQ.Client.Events;
using Services;
using Models;

namespace AppNS;
/// <summary>
/// Главный класс приложения
/// </summary>
class App {
  /// <summary>
  /// Сервис взаимодействия с Rabbit 
  /// </summary>
  public RabbitService RabbitService { get; set; }
  /// <summary>
  /// Сервис отправки HTTP-запросов
  /// </summary>
  public HttpService HttpService { get; set; }
  /// <summary>
  /// JSON сервис
  /// </summary>
  public JsonService JsonService { get; set; }
  /// <summary>
  /// Логер
  /// </summary>
  public LoggerService LoggerService { get; set; }
  /// <summary>
  /// Все точки Новосибирска
  /// </summary>
  public List<OsmNode> NskNodes { get; set; }
  /// <summary>
  /// Рандомайзер
  /// </summary>
  public Random Rand { get; set; }
  /// <summary>
  /// Список всех магазинов
  /// </summary>
  public List<Shop> Shops { get; set; }
  /// <summary>
  /// Список совпадений названия магазина и точек
  /// </summary>
  public List<ShopNameNodeMatch> ShopNameNodeMatches { get; set; }

  public App() {
    this.RabbitService = new RabbitService();
    this.HttpService = new HttpService();
    this.JsonService = new JsonService();
    this.LoggerService = new LoggerService();
    this.NskNodes = new List<OsmNode>();
    this.Rand = new Random();
    this.Shops = new List<Shop>();
    this.ShopNameNodeMatches = new List<ShopNameNodeMatch>();
  }

  /// <summary>
  /// Получение множества уникальных названий магазинов
  /// </summary>
  /// <param name="matches">Совпадения id товара и названия магазина</param>
  /// <returns>Множество названий магазинов</returns>
  private HashSet<string> GetUniqueShopNames(List<ProductIdShopNameMatch>? matches) {
    HashSet<string> shopNames = new HashSet<string>();

    foreach (ProductIdShopNameMatch match in matches) {
      shopNames.Add(match.ShopName.Trim().ToLower());
    }

    return shopNames;
  }

  /// <summary>
  /// Загрузка файла со всеми точками Новосибирска
  /// </summary>
  private async Task LoadNskNodesAsync() {
    string str = await File.ReadAllTextAsync(Config.DataPath);
    OsmResponse? osmResponse = this.JsonService.DeserializeFromString<OsmResponse>(str);
    this.NskNodes = osmResponse?.Elements ?? new List<OsmNode>();
  }

  /// <summary>
  /// Получение случайного целого числа
  /// </summary>
  /// <param name="from">От</param>
  /// <param name="to">До (включительно)</param>
  /// <returns>Целое число</returns>
  private int GetRandomInt(int from, int to) {
    return this.Rand.Next(from, to + 1);
  }

  /// <summary>
  /// Получение рандомной точки
  /// </summary>
  /// <param name="nodes">Список точек</param>
  /// <returns>Точка</returns>
  private OsmNode GetRandomNode(List<OsmNode> nodes) {
    int ind = this.GetRandomInt(0, nodes.Count - 1);
    OsmNode node = this.NskNodes[ind];
    return node;
  }

  /// <summary>
  /// Получение рандомных точек
  /// </summary>
  /// <returns>Список точек</returns>
  private List<OsmNode> GetRandomNodes() {
    int number = this.GetRandomInt(1, Config.MaxNodesNumber);
    List<OsmNode> result = new List<OsmNode>();
    for (int i = 0; i < number; ++i) {
      int ind = this.GetRandomInt(0, this.NskNodes.Count - 1);
      OsmNode node = this.NskNodes[ind];
      result.Add(node);
    }
    return result;
  }

  /// <summary>
  /// Получение магазина
  /// </summary>
  /// <param name="shopName">Название магазина</param>
  /// <param name="node">Точка</param>
  /// <returns>Магазин</returns>
  private Shop GetShop(string shopName, OsmNode node) {
    Shop? existedShop = this.Shops.Find(shop => shop.Name == shopName && shop.OsmNodeId == node.Id);
    // Если такой магазин уже существует, возвращем его,
    // если нет, то создаем
    if (existedShop != null) {
      return existedShop;
    }
    Coordinates coordinates = new Coordinates(node.Lat, node.Lon);
    Shop shop = new Shop(node.Id, shopName, node?.Tags?.ContactWebsite ?? "", coordinates);
    this.Shops.Add(shop);
    return shop;
  }

  /// <summary>
  /// Получение списка сопоставления id товара и магазина
  /// </summary>
  /// <param name="productShopMatches">Список сопоставления id товара и названия магазина</param>
  /// <returns>Список сопоставления id товара и магазина</returns>
  private List<ProductIdShopMatch> GetProductIdShopMatches(List<ProductIdShopNameMatch>? productIdShopNameMatches) {
    List<ProductIdShopMatch> result = new List<ProductIdShopMatch>();

    foreach (ProductIdShopNameMatch productIdShopNameMatch in productIdShopNameMatches) {
      ShopNameNodeMatch? shopNameNodeMatch = this.ShopNameNodeMatches.Find(match => match.ShopName == productIdShopNameMatch.ShopName.Trim().ToLower());
      if (shopNameNodeMatch != null) {
        OsmNode node = this.GetRandomNode(shopNameNodeMatch.Nodes);
        Shop shop = this.GetShop(shopNameNodeMatch.ShopName, node);
        ProductIdShopMatch productIdShopMatch = new ProductIdShopMatch(productIdShopNameMatch.ProductId, shop);
        result.Add(productIdShopMatch);
      }
    }
    return result;
  }

  /// <summary>
  /// Добавление сопоставления названия магазина и точек
  /// </summary>
  /// <param name="shopName">Название магазина</param>
  private async Task AddShopNameNodeMatchAsync(string shopName) {
    string url = $"https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=[out:json][timeout:{Config.OverpassTimeout}];area[place=city][name=\"Новосибирск\"]"
      + $" -> .nsk;node[name~\"{shopName}\",i](area.nsk) -> .data;.data out geom;";

    
    OsmResponse? osmResponse = null;
    try {
      osmResponse = await this.HttpService.Get<OsmResponse>(url);
    }
    catch (Exception err) {
      this.LoggerService.Error($"Error while sending request to {url}, error: {err.Message}", "App");
    }
    
    List<OsmNode> nodes = new List<OsmNode>();
    // Если не случилось ошибки при получении данных или в OSM что-то нашлось, добавляем точки оттуда,
    // если нет, то получаем рандомные из файла
    if (osmResponse is not null && osmResponse?.Elements?.Count > 0) {
      nodes = osmResponse.Elements;
    } else {
      nodes = this.GetRandomNodes();
    }
    ShopNameNodeMatch shopNameNodeMatch = new ShopNameNodeMatch(shopName, nodes);
    this.ShopNameNodeMatches.Add(shopNameNodeMatch);
  }

  /// <summary>
  /// Заполнение списка сопоставления названия магазина и точек
  /// </summary>
  /// <param name="uniqueShopNames">Уникальные названия магазинов</param>
  private async Task FillShopNameNodeMatchesAsync(HashSet<string> uniqueShopNames) {
    List<Task> tasks = new List<Task>();
    foreach (string shopName in uniqueShopNames) {
      Task task = this.AddShopNameNodeMatchAsync(shopName);
      tasks.Add(task);
    }
    await Task.WhenAll(tasks);
  }

  /// <summary>
  /// Закрытие приложения
  /// </summary>
  /// <param name="errorMessage">Сообщение об ошибке</param>
  private void Close(string errorMessage) {
    this.RabbitService.CloseConnection();
    this.LoggerService.Error($"Error occured {errorMessage}", "App");
    this.LoggerService.Log("Application shut down", "App");
    Environment.Exit(0);
  }

  /// <summary>
  /// Получение обработчика для очереди
  /// </summary>
  /// <param name="queueName">Название очереди</param>
  /// <returns>Обработчик</returns>
  private EventHandler<BasicDeliverEventArgs> getHandler(string queueName) {
    return async (consumer, args) => {
      try {
        byte[] bodyByteArray = args.Body.ToArray();
        this.LoggerService.Log($"Message from {queueName}, content length {bodyByteArray.Length} bytes", "App");
        List<ProductIdShopNameMatch>? productIdShopNameMatches = this.JsonService.DeserializeFromByteArray<List<ProductIdShopNameMatch>>(bodyByteArray);
        HashSet<string> uniqueShopNames = this.GetUniqueShopNames(productIdShopNameMatches);
        await this.FillShopNameNodeMatchesAsync(uniqueShopNames);
        this.LoggerService.Log($"ShopNameNodeMatches length: {this.ShopNameNodeMatches.Count}", "App");
        List<ProductIdShopMatch> productIdShopMatches = this.GetProductIdShopMatches(productIdShopNameMatches);
        this.LoggerService.Log($"Shops length: {this.Shops.Count}", "App");
        this.RabbitService.SendMessage<List<ProductIdShopMatch>>(Config.OsmRequesterExchange, Config.ShopsInRoutingKey, productIdShopMatches);
        this.Shops.Clear();
        this.ShopNameNodeMatches.Clear();
      } catch (Exception err) {
        this.Close(err.Message);
      }
      
    };
  }

  /// <summary>
  /// Старт приложеня
  /// </summary>
  public async Task Start() {
    this.LoggerService.Log("Application start", "App");

    try {
      await this.LoadNskNodesAsync();
      this.RabbitService.InitConnection();
      this.RabbitService.GetMessage(Config.ProductsOutQueue, this.getHandler(Config.ProductsOutQueue));
      Console.ReadLine();
    }
    catch (Exception err) {
      this.Close(err.Message);
    }
  }
}