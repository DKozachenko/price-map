from entities.category_3_level import Category3Level

class Category2Level:
  def __init__(self, name: str, categories3Level: list[Category3Level] = []) -> None:
    self.name: str = name
    self.categories3Level: list[Category3Level] = categories3Level



