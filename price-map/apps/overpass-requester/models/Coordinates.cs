using Newtonsoft.Json;
namespace Models;

class Coordinates {
  [JsonProperty("latitude")]
  public double Latitude { get; set; }
  [JsonProperty("longitude")]
  public double Longitude { get; set; }
  public Coordinates(double latitute, double longitude) {
    this.Latitude = latitute;
    this.Longitude = longitude;
  }
}