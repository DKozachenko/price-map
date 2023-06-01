using Newtonsoft.Json;
namespace Models;

/// <summary>
/// Класс сопоставления id товара и названия магазина
/// </summary>
class ProductIdShopNameMatch {
  /// <summary>
  /// Id товара
  /// </summary>
  [JsonProperty("product_id")]
  public string ProductId { get; set; }
  /// <summary>
  /// Название магазина
  /// </summary>
  [JsonProperty("shop_name")]
  public string ShopName { get; set; }
  public ProductIdShopNameMatch() {}
}