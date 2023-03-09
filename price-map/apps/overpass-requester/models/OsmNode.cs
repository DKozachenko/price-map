using Newtonsoft.Json;

namespace Models;
class OsmNode {
  [JsonProperty("type")]
  public string Type { get; set; }
  [JsonProperty("id")]
  public long Id { get; set; }
  [JsonProperty("lat")]
  public double Lat { get; set; }
  [JsonProperty("lon")]
  public double Lon { get; set; }
  [JsonProperty("tags")]
  public OsmTags? Tags { get; set; }
  public OsmNode() {}
}