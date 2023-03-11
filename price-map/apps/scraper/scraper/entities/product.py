from entities.characteristic import Characteristic
import uuid

class Product:
  """ Товар
  """

  def __init__(self, category_3_level_name: str, name: str, description: str, image_path: str, shop_name: str, price: float, characteristics: list[Characteristic]) -> None:
    self.id: str = self.__generate_id()
    """ Id """
    self.category3LevelName: str = category_3_level_name
    """ Название категории 3 уровня """
    self.name: str = name
    """ Название """
    self.description: str = description
    """ Описание """
    self.imagePath: str = image_path
    """ Путь до изоражения """
    self.shopName: str = shop_name
    """ Название магазина """
    self.price: float = price
    """ Цена """
    self.characteristics: list[Characteristic] = characteristics
    """ Характеристики """

  def __generate_id(self) -> str:
    """ Генерация id

    Returns:
      str: id
    """

    uuid_4 = uuid.uuid4()
    return str(uuid_4)