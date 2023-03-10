namespace Models;

class ShopNameNodeMatch {
  public string ShopName { get; set; }
  public List<OsmNode> Nodes { get; set; }
  public ShopNameNodeMatch(string shopName, List<OsmNode> nodes) {
    this.ShopName = shopName;
    this.Nodes = nodes;
  }
}