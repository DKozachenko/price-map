from entities.category_2_level import Category2Level
import json

class Category1Level:
  def __init__(self, name: str, categories2Level: list[Category2Level] = []) -> None:
    self.name: str = name
    self.categories2Level: list[Category2Level] = categories2Level

  def to_json(self) -> str:
    return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=0)



