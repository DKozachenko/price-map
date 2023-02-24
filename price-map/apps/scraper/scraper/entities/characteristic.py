class Characteristic:
  def __init__(self, name: str, value: int | float | str) -> None:
    self.name: str = name
    self.value: int | float | str = value
