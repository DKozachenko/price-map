using Newtonsoft.Json;
namespace Models;

class ProductShopMatch {
  [JsonProperty("product_id")]
  public string ProductId { get; set; }
  [JsonProperty("shop_name")]
  public string ShopName { get; set; }
  public ProductShopMatch() {}
}