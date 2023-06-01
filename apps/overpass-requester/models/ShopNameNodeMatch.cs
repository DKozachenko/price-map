namespace Models;

/// <summary>
/// Класс сопоставления названия магазина и точек
/// </summary>
class ShopNameNodeMatch {
  /// <summary>
  /// Название магазина
  /// </summary>
  public string ShopName { get; set; }
  /// <summary>
  /// Точки
  /// </summary>
  public List<OsmNode> Nodes { get; set; }
  public ShopNameNodeMatch(string shopName, List<OsmNode> nodes) {
    this.ShopName = shopName;
    this.Nodes = nodes;
  }
}