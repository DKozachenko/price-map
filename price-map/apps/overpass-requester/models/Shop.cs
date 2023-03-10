using Newtonsoft.Json;

namespace Models;

class Shop {
  private string id;
  private long osmNodeId;
  private string name;
  private string website;
  private Coordinates coordinates;
  [JsonProperty("id")]
  public string Id { get { return this.id; } set { this.id = value; } }
  [JsonProperty("osmNodeId")]
  public long OsmNodeId { get { return this.osmNodeId; } set { this.osmNodeId = value; } }
  [JsonProperty("name")]
  public string Name { get { return this.name; } set { this.name = value; } }
  [JsonProperty("website")]
  public string Website { get { return this.website; } set { this.website = value; } }
  [JsonProperty("coordinates")]
  public Coordinates Coordinates { get { return this.coordinates; } set { this.coordinates = value; } }
  public Shop(long osmNodeId, string name, string website, Coordinates coordinates) {
    this.Id = Guid.NewGuid().ToString();
    this.OsmNodeId = osmNodeId;
    this.Name = name;
    this.Website = website;
    this.Coordinates = coordinates;
  }
}