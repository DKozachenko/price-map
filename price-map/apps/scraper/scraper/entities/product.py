from entities.characteristic import Characteristic

class Product:
  def __init__(self, category_3_level_name: str, name: str, description: str, image_path: str, shop_name: str, price: int, characteristics: list[Characteristic]) -> None:
    self.category_3_level_name: str = category_3_level_name
    self.name: str = name
    self.description: str = description
    self.image_path: str = image_path
    self.shop_name: str = shop_name
    self.price: int = price
    self.characteristics: list[Characteristic] = characteristics
