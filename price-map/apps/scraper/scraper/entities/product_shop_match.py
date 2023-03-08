class ProductShopMatch:
  """ Сопоставление товара и магазина (от товара - id, от магазина - название)
  """

  def __init__(self, product_id: str, shopName: str) -> None:
    self.product_id: str = product_id
    self.shopName: str = shopName



