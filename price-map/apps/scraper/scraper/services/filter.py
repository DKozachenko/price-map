from entities.category_1_level import Category1Level
from entities.category_2_level import Category2Level
from entities.category_3_level import Category3Level
from entities.product import Product

class FilterService:
  """ Сервис фильтрации
  """

  def __init__(self) -> None:
    pass

  def filter_categories_1_level(self, categories_1_level: list[Category1Level]) -> list[Category1Level]:
    """ Фильтрация категорий 1 уровня

    Args:
      categories_1_level (list[Category1Level]): категории 1 уровня

    Returns:
      list[Category1Level]: отфильтрованные категории 1 уровня
    """

    filtered_categories_1_level: list[Category1Level] = []
        
    for category_1_level in categories_1_level:
      filtered_categories_2_level: list[Category2Level] = []
      
      for category2Level in category_1_level.categories2Level:
        filtered_categories_3_level: list[Category3Level] = []
        
        for category3Level in category2Level.categories3Level:
          if len(category3Level.name) > 0 and len(category3Level.filters) > 0:
            filtered_category_3_level: Category3Level = Category3Level(category3Level.name, category3Level.filters)
            filtered_categories_3_level.append(filtered_category_3_level)
        
        if len(category2Level.name) > 0 and len(filtered_categories_3_level) > 0:
          filtered_category_2_level: Category2Level = Category2Level(category2Level.name, filtered_categories_3_level)
          filtered_categories_2_level.append(filtered_category_2_level)
      
      if len(category_1_level.name) > 0 and len(filtered_categories_2_level) > 0:
        filtered_category_1_level: Category1Level = Category1Level(category_1_level.name, filtered_categories_2_level)
        filtered_categories_1_level.append(filtered_category_1_level)
    
    return filtered_categories_1_level
  
  def filter_products(self, products: list[Product]) -> list[Product]:
    """ Фильтрация товаров

    Args:
      products (list[Product]): товары

    Returns:
      list[Product]: отфильтрованные товары
    """

    filtered_products: list[Product] = []

    for product in products:
      if len(product.name) > 0 and len(product.category3LevelName) > 0 and len(product.shopName) and product.price > 0.0 and len(product.characteristics) > 0:
        filtered_products.append(product)

    return filtered_products
