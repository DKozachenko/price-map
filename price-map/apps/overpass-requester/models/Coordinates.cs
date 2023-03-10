using Newtonsoft.Json;
namespace Models;

/// <summary>
/// Класс координат
/// </summary>
class Coordinates {
  /// <summary>
  /// Широта
  /// </summary>
  [JsonProperty("latitude")]
  public double Latitude { get; set; }
  /// <summary>
  /// Долгота
  /// </summary>
  [JsonProperty("longitude")]
  public double Longitude { get; set; }
  public Coordinates(double latitute, double longitude) {
    this.Latitude = latitute;
    this.Longitude = longitude;
  }
}