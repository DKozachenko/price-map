from entities.filter import Filter

class Category3Level:
  """ Категория 3 уровня
  """

  def __init__(self, name: str, filters: list[Filter] = []) -> None:
    self.name: str = name
    """ Название """
    self.filters: list[Filter] = filters
    """ Фильтры """
