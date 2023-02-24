from typing import Union

class Characteristic:
  def __init__(self, name: str, value: Union[int, float, str]) -> None:
    self.name: str = name
    self.value: Union[int, float, str] = value
