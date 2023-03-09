using Newtonsoft.Json;
namespace Models;

class ProductIdShopMatch {
  private string productId;
  private Shop shop;
  [JsonProperty("productId")]
  public string ProductId { get { return this.productId; } set { this.productId = value; } }
  [JsonProperty("shop")]
  public Shop Shop { get { return this.shop; } set { this.shop = value; } }
  public ProductIdShopMatch(string productId, Shop shop) {
    this.ProductId = productId;
    this.Shop = shop;
  }
}