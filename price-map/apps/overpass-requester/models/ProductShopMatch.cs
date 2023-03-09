namespace Models;

class ProductShopMatch {
  private string ProductId;
  private string ShopName;
  public string product_id { get { return this.ProductId; } set { this.ProductId = value; } }
  public string shopName { get { return this.ShopName; } set { this.ShopName = value; } }
  public ProductShopMatch() {}
}