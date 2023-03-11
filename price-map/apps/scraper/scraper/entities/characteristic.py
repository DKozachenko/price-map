class Characteristic:
  """ Характеристика
  """

  def __init__(self, name: str, value: float | str | bool) -> None:
    self.name: str = name
    """ Название """
    self.value: float | str | bool = value
    """ Значение """
