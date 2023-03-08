from entities.characteristic import Characteristic
import uuid

class Product:
  """ Товар
  """

  def __init__(self, category_3_level_name: str, name: str, description: str, image_path: str, shop_name: str, price: float, characteristics: list[Characteristic]) -> None:
    self.id: str = self.__generate_id()
    self.category3LevelName: str = category_3_level_name
    self.name: str = name
    self.description: str = description
    self.imagePath: str = image_path
    self.shopName: str = shop_name
    self.price: float = price
    self.characteristics: list[Characteristic] = characteristics

  def __generate_id(self) -> str:
    """ Генерация id

    Returns:
      str: id
    """

    uuid_4 = uuid.uuid4()
    return str(uuid_4)