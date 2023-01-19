import { Category2Level } from "@core/entities"
import { ICategory3LevelForView } from "."

export interface ICategory2LevelForView extends Omit<Category2Level, 'categories3Level'> {
  checked: boolean,
  showCategories3Level: boolean,
  categories3Level: ICategory3LevelForView[]
}