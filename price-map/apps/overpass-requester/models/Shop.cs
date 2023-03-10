using Newtonsoft.Json;

namespace Models;

class Shop {
  [JsonProperty("id")]
  public string Id { get; set; }
  [JsonProperty("osmNodeId")]
  public long OsmNodeId { get; set; }
  [JsonProperty("name")]
  public string Name { get; set; }
  [JsonProperty("website")]
  public string Website { get; set; }
  [JsonProperty("coordinates")]
  public Coordinates Coordinates { get; set; }
  public Shop(long osmNodeId, string name, string website, Coordinates coordinates) {
    this.Id = Guid.NewGuid().ToString();
    this.OsmNodeId = osmNodeId;
    this.Name = name;
    this.Website = website;
    this.Coordinates = coordinates;
  }
}