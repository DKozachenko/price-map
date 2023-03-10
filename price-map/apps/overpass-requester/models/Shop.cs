using Newtonsoft.Json;

namespace Models;

/// <summary>
/// Класс магазина
/// </summary>
class Shop {
  /// <summary>
  /// Id
  /// </summary>
  [JsonProperty("id")]
  public string Id { get; set; }
  /// <summary>
  /// Id в OSM
  /// </summary>
  [JsonProperty("osmNodeId")]
  public long OsmNodeId { get; set; }
  /// <summary>
  /// Название
  /// </summary>
  [JsonProperty("name")]
  public string Name { get; set; }
  /// <summary>
  /// Вебсайт
  /// </summary>
  [JsonProperty("website")]
  public string Website { get; set; }
  /// <summary>
  /// Координаты
  /// </summary>
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