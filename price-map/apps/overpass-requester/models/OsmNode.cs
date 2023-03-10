using Newtonsoft.Json;

namespace Models;

/// <summary>
/// Класс точки из Overpass API (в действительности там намного больше полей, здесь лишь нужные)
/// </summary>
class OsmNode {
  /// <summary>
  /// Тип
  /// </summary>
  [JsonProperty("type")]
  public string Type { get; set; }
  /// <summary>
  /// Id в OSM
  /// </summary>
  [JsonProperty("id")]
  public long Id { get; set; }
  /// <summary>
  /// Широта
  /// </summary>
  [JsonProperty("lat")]
  public double Lat { get; set; }
  /// <summary>
  /// Долгота
  /// </summary>
  [JsonProperty("lon")]
  public double Lon { get; set; } 
  /// <summary>
  /// Тэги
  /// </summary>
  [JsonProperty("tags")]
  public OsmTags? Tags { get; set; }
  public OsmNode() {}
}