class ProductShopMatch:
  """ Сопоставление товара и магазина (от товара - id, от магазина - название)
  """

  def __init__(self, product_id: str, shop_name: str) -> None:
    self.product_id: str = product_id
    """ Id товара """
    self.shop_name: str = shop_name
    """ Название магазина """


