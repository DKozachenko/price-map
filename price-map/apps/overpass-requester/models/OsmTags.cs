using Newtonsoft.Json;

namespace Models;
class OsmTags {
  [JsonProperty("contact:website")]
  public string? ContactWebsite { get; set; }
  public OsmTags() {}
}