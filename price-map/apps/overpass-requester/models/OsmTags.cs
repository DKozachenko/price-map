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
  /// <summary>
  /// Количество этажей
  /// </summary>
  [JsonProperty("building:levels")]
  public string? BuildingLevels { get; set; }
  public OsmTags() {}
}