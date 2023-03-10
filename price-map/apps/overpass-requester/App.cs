using System.Text;
using RabbitMQ.Client.Events;
using Services;
using Models;
using System.Diagnostics;

class App {
  public RabbitService RabbitService { get; set; }
  public HttpService HttpService { get; set; }
  public JsonService JsonService { get; set; }
  public LoggerService LoggerService { get; set; }
  public List<OsmNode> NskNodes { get; set; }
  public Random Rand { get; set; }
  public List<Shop> Shops { get; set; }
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

  private HashSet<string> GetUniqueShopNames(List<ProductShopMatch> matches) {
    HashSet<string> shopNames = new HashSet<string>();

    foreach (ProductShopMatch match in matches) {
      shopNames.Add(match.ShopName.Trim().ToLower());
    }

    return shopNames;
  }

  private void LoadNskNodes() {
    string str = File.ReadAllText(Constants.DataPath);
    OsmResponse osmResponse = this.JsonService.DeserializeFromString<OsmResponse>(str);
    this.NskNodes = osmResponse.Elements;
  }

  private int GetRandomInt(int from, int to) {
    return this.Rand.Next(from, to + 1);
  }

  private OsmNode GetRandomNode(List<OsmNode> nodes) {
    int ind = this.GetRandomInt(0, nodes.Count - 1);
    OsmNode node = this.NskNodes[ind];
    return node;
  }

  private List<OsmNode> GetRandomNodes() {
    int number = this.GetRandomInt(1, Constants.MaxNodesNumber);
    List<OsmNode> result = new List<OsmNode>();
    for (int i = 0; i < number; ++i) {
      int ind = this.GetRandomInt(0, this.NskNodes.Count - 1);
      OsmNode node = this.NskNodes[ind];
      result.Add(node);
    }
    return result;
  }

  private async Task AddShopNameNodeMatchAsync(string shopName) {
    string url = $"https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=[out:json][timeout:60];area[place=city][name=\"Новосибирск\"] -> .nsk;node[name~\"{shopName}\",i](area.nsk) -> .data;.data out geom;";
    OsmResponse osmResponse = await this.HttpService.Get<OsmResponse>(url);

    List<OsmNode> nodes = new List<OsmNode>();
    if (osmResponse.Elements.Count > 0) {
      nodes = osmResponse.Elements;
    } else {
      nodes = this.GetRandomNodes();
    }
    ShopNameNodeMatch shopNameNodeMatch = new ShopNameNodeMatch(shopName, nodes);
    this.ShopNameNodeMatches.Add(shopNameNodeMatch);
  }

  private async Task FillShopNameNodeMatchesAsync(HashSet<string> uniqueShopNames) {
    List<ShopNameNodeMatch> result = new List<ShopNameNodeMatch>();
    List<Task> tasks = new List<Task>();
    foreach (string shopName in uniqueShopNames) {
      Task task = this.AddShopNameNodeMatchAsync(shopName);
      tasks.Add(task);
    }
    await Task.WhenAll(tasks);
  }

  private Shop GetShop(string shopName, OsmNode node) {
    Shop? existedShop = this.Shops.Find(shop => shop.Name == shopName && shop.OsmNodeId == node.Id);
    if (existedShop != null) {
      return existedShop;
    }
    Coordinates coordinates = new Coordinates(node.Lat, node.Lon);
    Shop shop = new Shop(node.Id, shopName, node?.Tags?.ContactWebsite ?? "", coordinates);
    this.Shops.Add(shop);
    return shop;
  }

  private List<ProductIdShopMatch> GetProductIdShopMatches(List<ProductShopMatch> productShopMatches) {
    List<ProductIdShopMatch> result = new List<ProductIdShopMatch>();

    foreach (ProductShopMatch productShopMatch in productShopMatches) {
      ShopNameNodeMatch? shopNameNodeMatch = this.ShopNameNodeMatches.Find(match => match.ShopName == productShopMatch.ShopName.Trim().ToLower());
      if (shopNameNodeMatch != null) {
        OsmNode node = this.GetRandomNode(shopNameNodeMatch.Nodes);
        Shop shop = this.GetShop(shopNameNodeMatch.ShopName, node);
        ProductIdShopMatch productIdShopMatch = new ProductIdShopMatch(productShopMatch.ProductId, shop);
        result.Add(productIdShopMatch);
      }
    }
    return result;
  }

  private EventHandler<BasicDeliverEventArgs> getHandler(string queueName) {
    return async (consumer, args) => {
      byte[] bodyByteArray = args.Body.ToArray();
      this.LoggerService.Log($"Message from {queueName}, content length {bodyByteArray.Length} bytes", "App");
      List<ProductShopMatch> productShopMatches = this.JsonService.DeserializeFromByteArray<List<ProductShopMatch>>(bodyByteArray);
      HashSet<string> uniqueShopNames = this.GetUniqueShopNames(productShopMatches);
      await this.FillShopNameNodeMatchesAsync(uniqueShopNames);
      this.LoggerService.Log($"ShopNameNodeMatches length: {this.ShopNameNodeMatches.Count}", "App");
      List<ProductIdShopMatch> productIdShopMatches = this.GetProductIdShopMatches(productShopMatches);
      this.LoggerService.Log($"Shops length: {this.Shops.Count}", "App");
      this.RabbitService.SendMessage<List<ProductIdShopMatch>>(Constants.OsmRequesterExchange, Constants.ShopsInRoutingKey, productIdShopMatches);
      this.Shops.Clear();
      this.ShopNameNodeMatches.Clear();
    };
  }


  public void Start() {
    this.LoggerService.Log("Application start", "App");

    try {
      this.LoadNskNodes();
      this.RabbitService.InitConnection();
      this.RabbitService.GetMessage<string>(Constants.ProductsOutQueue, this.getHandler(Constants.ProductsOutQueue));
      Console.ReadLine();
    }
    catch (Exception err) {
      this.RabbitService.CloseConnection();
      this.LoggerService.Error("Error occured " + err.Message, "App");
      this.LoggerService.Log("Application shut down", "App");
    }
  }
}