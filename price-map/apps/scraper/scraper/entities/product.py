from entities.characteristic import Characteristic

class Product:
  """ Товар
  """

  def __init__(self, category_3_level_name: str, name: str, description: str, image_path: str, shop_name: str, price: float, characteristics: list[Characteristic]) -> None:
    self.category3LevelName: str = category_3_level_name
    self.name: str = name
    self.description: str = description
    self.imagePath: str = image_path
    self.shopName: str = shop_name
    self.price: float = price
    self.characteristics: list[Characteristic] = characteristics
