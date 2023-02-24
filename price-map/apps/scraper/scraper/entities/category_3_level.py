from entities.filter import Filter

class Category3Level:
  def __init__(self, name: str, filters: list[Filter] = []) -> None:
    self.name: str = name
    self.filters: list[Filter] = filters



