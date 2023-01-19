import { Category1Level } from "@core/entities"

export interface ICategory1LevelForView extends Omit<Category1Level, 'categories2Level'> {
  checked: boolean,
  showCategories2Level: boolean,
  categories2Level: any[]
}