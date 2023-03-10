using System.Text;
using RabbitMQ.Client.Events;
using Services;
using Models;
using System.Diagnostics;

class App {
  private RabbitService rabbitService;
  private HttpService httpService;
  private JsonService jsonService;
  private LoggerService loggerService;
  private List<OsmNode> nskNodes;
  private Random rand;
  private List<Shop> shops;
  public RabbitService RabbitService { get { return this.rabbitService; } set { this.rabbitService = value; } }
  public HttpService HttpService { get { return this.httpService; } set { this.httpService = value; } }
  public JsonService JsonService { get { return this.jsonService; } set { this.jsonService = value; } }
  public LoggerService LoggerService { get { return this.loggerService; } set { this.loggerService = value; } }
  public List<OsmNode> NskNodes { get { return this.nskNodes; } set { this.nskNodes = value; } }
  public Random Rand { get { return this.rand; } set { this.rand = value; } }
  public List<Shop> Shops { get { return this.shops; } set { this.shops = value; } }

  public EventHandler<BasicDeliverEventArgs> handler = (model, ea) => {
    byte[] body = ea.Body.ToArray();
    string message = Encoding.UTF8.GetString(body);
    Console.WriteLine($" [x] Received {message}"); 
  };

  public App() {
    this.RabbitService = new RabbitService();
    this.HttpService = new HttpService();
    this.JsonService = new JsonService();
    this.LoggerService = new LoggerService();
    this.NskNodes = new List<OsmNode>();
    this.Rand = new Random();
    this.Shops = new List<Shop>();
  }

  private HashSet<string> GetUniqueShopNames(List<ProductShopMatch> matches) {
    HashSet<string> shopNames = new HashSet<string>();

    foreach (ProductShopMatch match in matches) {
      shopNames.Add(match.ShopName);
    }

    return shopNames;
  }

  private void LoadNskNodes() {
    string str = File.ReadAllText("./data/nodes_nsk.json");
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
    int number = this.GetRandomInt(1, 25);
    List<OsmNode> result = new List<OsmNode>();
    for (int i = 0; i < number; ++i) {
      int ind = this.GetRandomInt(0, this.NskNodes.Count - 1);
      OsmNode node = this.NskNodes[ind];
      result.Add(node);
    }
    return result;
  }

  private async Task<List<ShopNameNodeMatch>> GetShopNameNodeMatches(HashSet<string> uniqueShopNames) {
    List<ShopNameNodeMatch> result = new List<ShopNameNodeMatch>();
    foreach (string shopName in uniqueShopNames) {
      OsmResponse osmResponse = await this.HttpService.Get<OsmResponse>($"https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=[out:json];area[place=city][name=\"Новосибирск\"] -> .nsk;node[name~\"{shopName}\"](area.nsk) -> .data;.data out geom;");
      List<OsmNode> nodes = new List<OsmNode>();
      if (osmResponse.Elements.Count > 0) {
        nodes = osmResponse.Elements;
      } else {
        nodes = this.GetRandomNodes();
      }
      ShopNameNodeMatch shopNameNodeMatch = new ShopNameNodeMatch(shopName, nodes);
      result.Add(shopNameNodeMatch);
    }
    return result;
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

  private List<ProductIdShopMatch> GetProductIdShopMatches(List<ProductShopMatch> productShopMatches, List<ShopNameNodeMatch> shopNameNodeMatches) {
    List<ProductIdShopMatch> result = new List<ProductIdShopMatch>();

    foreach (ProductShopMatch productShopMatch in productShopMatches) {
      ShopNameNodeMatch? shopNameNodeMatch = shopNameNodeMatches.Find(match => match.ShopName == productShopMatch.ShopName);
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
      this.LoggerService.Log($"Unique shop names: {uniqueShopNames.Count}", "App");
      List<ShopNameNodeMatch> shopNameNodeMatches = await this.GetShopNameNodeMatches(uniqueShopNames);
      List<ProductIdShopMatch> productIdShopMatches = this.GetProductIdShopMatches(productShopMatches, shopNameNodeMatches);
      this.RabbitService.SendMessage<List<ProductIdShopMatch>>("osrm-requester-exchange", "shops_in", productIdShopMatches);
      this.Shops.Clear();
    };
  }


  public void Start() {
    this.LoggerService.Log("Application start", "App");

    try {
      this.LoadNskNodes();
      this.RabbitService.InitConnection();
      this.RabbitService.GetMessage<string>("products_out_queue", this.getHandler("products_out_queue"));
      Console.ReadLine();
    }
    catch (Exception err) {
      this.RabbitService.CloseConnection();
      this.LoggerService.Error("Error occured " + err.Message, "App");
      this.LoggerService.Log("Application shut down", "App");
    }
  }
}