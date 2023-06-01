from entities.category_2_level import Category2Level

class Category1Level:
  """ Категория 1 уровня
  """

  def __init__(self, name: str, categories2Level: list[Category2Level] = []) -> None:
    self.name: str = name
    """ Название """
    self.categories2Level: list[Category2Level] = categories2Level
    """ Категории 2 уровня """



