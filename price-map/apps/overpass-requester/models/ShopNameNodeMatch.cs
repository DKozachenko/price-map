namespace Models;

class ShopNameNodeMatch {
  private string shopName;
  private List<OsmNode> nodes;
  public string ShopName { get { return this.shopName; } set { this.shopName = value; } }
  public List<OsmNode> Nodes { get { return this.nodes; } set { this.nodes = value; } }
  public ShopNameNodeMatch(string shopName, List<OsmNode> nodes) {
    this.ShopName = shopName;
    this.Nodes = nodes;
  }
}