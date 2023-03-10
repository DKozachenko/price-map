using Newtonsoft.Json;
namespace Models;

class ProductIdShopMatch {
  [JsonProperty("productId")]
  public string ProductId { get; set; }
  [JsonProperty("shop")]
  public Shop Shop { get; set; }
  public ProductIdShopMatch(string productId, Shop shop) {
    this.ProductId = productId;
    this.Shop = shop;
  }
}