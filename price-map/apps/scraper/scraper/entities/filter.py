class Filter:
  """ Фильтр
  """

  def __init__(self, name: str, type: str, values: list[str] | list[int] | list[float] = []) -> None:
    self.name: str = name
    self.type: str = type
    self.values: list[str] | list[int] | list[float] = values
