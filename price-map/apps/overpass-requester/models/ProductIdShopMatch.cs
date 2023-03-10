using Newtonsoft.Json;
namespace Models;

/// <summary>
/// Класс сопоставления id товара и магазина
/// </summary>
class ProductIdShopMatch {
  /// <summary>
  /// Id товара
  /// </summary>
  [JsonProperty("productId")]
  public string ProductId { get; set; }
  /// <summary>
  /// Магазин
  /// </summary>
  [JsonProperty("shop")]
  public Shop Shop { get; set; }
  public ProductIdShopMatch(string productId, Shop shop) {
    this.ProductId = productId;
    this.Shop = shop;
  }
}