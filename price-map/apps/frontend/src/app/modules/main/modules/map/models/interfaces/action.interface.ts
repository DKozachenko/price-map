import { ActionName, ActionDirection } from "../types";

export interface IAction {
  id: string,
  name: ActionName,
  direction: ActionDirection
}