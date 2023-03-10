using Newtonsoft.Json;

namespace Models;
/// <summary>
/// Класс тэгов из Overpass API (в действительности там намного больше полей, здесь лишь нужные)
/// </summary>
class OsmTags {
  /// <summary>
  /// Вебсайт
  /// </summary>
  [JsonProperty("contact:website")]
  public string? ContactWebsite { get; set; }
  public OsmTags() {}
}