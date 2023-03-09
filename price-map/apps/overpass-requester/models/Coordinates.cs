using Newtonsoft.Json;
namespace Models;

class Coordinates {
  private double latitude;
  private double longitude;
  [JsonProperty("latitude")]
  public double Latitude { get { return this.latitude; } set { this.latitude = value; } }
  [JsonProperty("longitude")]
  public double Longitude { get { return this.longitude; } set { this.longitude = value; } }
  public Coordinates(double latitute, double longitude) {
    this.Latitude = latitute;
    this.Longitude = longitude;
  }
}