using Newtonsoft.Json;

namespace Models;
class OsmResponse {
  [JsonProperty("elements")]
  public List<OsmNode> Elements { get; set; }
  public OsmResponse() {}
}