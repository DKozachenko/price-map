from typing import Optional, Union

class Filter:
  def __init__(self, name: str, type: str, values: Optional[Union[list[str], list[Union[int, float]]]] = []) -> None:
    self.name: str = name
    self.type: str = type
    self.values: Optional[Union[list[str], list[Union[int, float]]]] = values
