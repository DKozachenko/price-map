class Filter:
  """ Фильтр
  """

  def __init__(self, name: str, type: str, values: list[str] | list[float] = []) -> None:
    self.name: str = name
    """ Название """
    self.type: str = type
    """ Тип (boolean / enum / range) """
    self.values: list[str] | list[float] = values
    """ Возможные значения """
