using System.Text;
using RabbitMQ.Client.Events;
using Services;
using Models;
using System.Diagnostics;

class App {
  private RabbitService rabbitService;
  private HttpService httpService;
  private JsonService jsonService;
  private List<OsmNode> nskNodes;
  public RabbitService RabbitService { get { return this.rabbitService; } set { this.rabbitService = value; } }
  public HttpService HttpService { get { return this.httpService; } set { this.httpService = value; } }
  public JsonService JsonService { get { return this.jsonService; } set { this.jsonService = value; } }
  public List<OsmNode> NskNodes { get { return this.nskNodes; } set { this.nskNodes = value; } }

  public EventHandler<BasicDeliverEventArgs> handler = (model, ea) => {
    byte[] body = ea.Body.ToArray();
    string message = Encoding.UTF8.GetString(body);
    Console.WriteLine($" [x] Received {message}"); 
  };

  public App() {
    this.RabbitService = new RabbitService();
    this.HttpService = new HttpService();
    this.JsonService = new JsonService();
    this.NskNodes = new List<OsmNode>();
  }

  private HashSet<string> GetUniqueShopNames(List<ProductShopMatch> matches) {
    HashSet<string> shopNames = new HashSet<string>();

    foreach (ProductShopMatch match in matches) {
      shopNames.Add(match.shopName);
    }

    return shopNames;
  }

  private void LoadNskNodes() {
    string str = File.ReadAllText("./data/nodes_nsk.json");
    OsmResponse osmResponse = this.JsonService.DeserializeFromString<OsmResponse>(str);
    // System.Console.WriteLine($"all {osmResponse.Elements.Count}");
    List<OsmNode> filteredNodes = osmResponse.Elements.Where<OsmNode>(Node => Node.Tags != null && Node.Tags.ContactWebsite != null).ToList<OsmNode>();
    this.NskNodes = filteredNodes;
  }

  private EventHandler<BasicDeliverEventArgs> getHandler() {
    return async (consumer, args) => {
      byte[] bodyByteArray = args.Body.ToArray();
      List<ProductShopMatch> productShopMatches = this.JsonService.DeserializeFromByteArray<List<ProductShopMatch>>(bodyByteArray);
      Console.WriteLine($" [x] Received {productShopMatches.Count}");  
      HashSet<string> uniqueShopNames = this.GetUniqueShopNames(productShopMatches);
      List<ShopNameNodeMatch> shopNameNodeMatches = new List<ShopNameNodeMatch>();

      foreach (string shopName in uniqueShopNames) {
        OsmResponse result = await this.HttpService.Get<OsmResponse>($"https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=[out:json];area[place=city][name=\"Новосибирск\"] -> .nsk;node[name~\"{shopName}\"](area.nsk) -> .data;.data out geom;");
        ShopNameNodeMatch shopNameNodeMatch = new ShopNameNodeMatch(shopName, result.Elements);
        shopNameNodeMatches.Add(shopNameNodeMatch);
      }

      foreach (var item in shopNameNodeMatches) {
        System.Console.WriteLine($"name {item.ShopName}");

        foreach (var node in item.Nodes) {
          System.Console.WriteLine($"\t {node.Id} {node.Type} {node.Lat} {node.Lon} {node?.Tags?.ContactWebsite}");
        }
      }
      
    };
  }


  public void Start() {
    this.LoadNskNodes();

    // this.RabbitService.GetMessage<string>("products_out_queue", this.getHandler());
    Console.ReadLine();
  }
}