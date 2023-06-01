using Newtonsoft.Json;

namespace Models;

/// <summary>
/// Класс ответа из Overpass API (в действительности там чуть больше полей, здесь лишь нужные)
/// </summary>
class OsmResponse {
  /// <summary>
  /// Элементы
  /// </summary>
  [JsonProperty("elements")]
  public List<OsmNode> Elements { get; set; }
  public OsmResponse() {}
}