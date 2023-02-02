import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Component, OnInit } from '@angular/core';
import { NotificationService, WebSocketService } from '../../../../services';
import { FilterService } from '../../services';
import { Category1Level, Category2Level, Category3Level } from '@core/entities';
import { ICategory1LevelForView, ICategory2LevelForView, ICategory3LevelForView } from '../../models/interfaces';
import { IResponseData } from '@core/interfaces';
import { CategoryEvents } from '@core/enums';

/**
 * Компонент фильтра
 * @export
 * @class FilterComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'price-map-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
  /**
   * Сет из id выбранных категорий 3 уровня
   * @private
   * @type {Set<string>}
   * @memberof FilterComponent
   */
  private setChechedCategory3LevelIds: Set<string> = new Set<string>();
  
  /**
   * Категории 1 уровня для отображения
   * @type {ICategory1LevelForView[]}
   * @memberof FilterComponent
   */
  public categories1Level: ICategory1LevelForView[] = [];

  /**
   * Показывать ли характеристики категории 3 уровня
   * @type {boolean}
   * @memberof FilterComponent
   */
  public isShowCharacteristics: boolean = false;

  constructor(private readonly filterService: FilterService,
    private readonly webSocketSevice: WebSocketService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.webSocketSevice.on<IResponseData<null>>(CategoryEvents.GetCategories1LevelFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketSevice.on<IResponseData<Category1Level[]>>(CategoryEvents.GetCategories1LevelSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Category1Level[]>) => this.categories1Level = response.data.map(this.mapData));

    this.webSocketSevice.emit(CategoryEvents.GetCategories1LevelAttempt);

    this.filterService.chechedCategory3LevelIds$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe((data: Set<string>) => this.isShowCharacteristics = data.size === 1);
  }

  /**
   * Преобразование данных из БД в данные для отображения
   * @private
   * @param {Category1Level} categories1Level категория 1 уровня из БД
   * @return {*}  {ICategory1LevelForView} категория 1 уровня для отображения
   * @memberof FilterComponent
   */
  private mapData(categories1Level: Category1Level): ICategory1LevelForView {
    return {
      ...categories1Level,
      categories2Level: categories1Level.categories2Level.map((category2Level: Category2Level) => {
        return {
          ...category2Level,
          showCategories3Level: false,
          categories3Level: category2Level.categories3Level.map((category3Level: Category3Level) => {
            return {
              ...category3Level,
              checked: false
            };
          }),
          checked: false
        };
      }),
      showCategories2Level: false,
      checked: false
    };
  } 

  /**
   * Показать категории 2 уровня
   * @param {ICategory1LevelForView} category1Level категория 1 уровня
   * @memberof FilterComponent
   */
  public showCategories2Level(category1Level: ICategory1LevelForView): void {
    category1Level.showCategories2Level = !category1Level.showCategories2Level;
  }

  /**
   * Показать категории 3 уровня
   * @param {ICategory2LevelForView} category2Level категория 2 уровня
   * @memberof FilterComponent
   */
  public showCategories3Level(category2Level: ICategory2LevelForView): void {
    category2Level.showCategories3Level = !category2Level.showCategories3Level;
  }

  /**
   * Выбрать категорию 1 уровня
   * @param {ICategory1LevelForView} category1Level категория 1 уровня
   * @memberof FilterComponent
   */
  public select1LevelCategory(category1Level: ICategory1LevelForView): void {
    category1Level.checked = !category1Level.checked;
    if (category1Level.checked) {
      category1Level.showCategories2Level = true;
    }

    for (const cat2Level of category1Level.categories2Level) {
      if (category1Level.checked) {
        cat2Level.showCategories3Level = true;
      }

      cat2Level.checked = category1Level.checked;

      for (const cat3Level of cat2Level.categories3Level) {
        cat3Level.checked = category1Level.checked;
      }
    }
    this.checkSelectedCategories3Level();
  }

  /**
   * Выбрать категорию 2 уровня
   * @param {ICategory2LevelForView} category2Level категория 2 уровня
   * @memberof FilterComponent
   */
  public select2LevelCategory(category2Level: ICategory2LevelForView): void {
    category2Level.checked = !category2Level.checked;
    if (category2Level.checked) {
      category2Level.showCategories3Level = true;
    }

    for (const cat3Level of category2Level.categories3Level) {
      cat3Level.checked = category2Level.checked;
    }

    const category1Level =  this.categories1Level.find((cat1Level) => {
      const cat2Level = cat1Level.categories2Level.find((cat2Level: ICategory2LevelForView) => {
        return cat2Level.id === category2Level.id;
      });
      return cat2Level;
    });

    if (category1Level) {
      category1Level.checked = category1Level.categories2Level.every((cat2: ICategory2LevelForView) => {
        return cat2.checked;
      });
    }

    this.checkSelectedCategories3Level();
  }

  /**
   * Выбрать категорию 3 уровня
   * @param {ICategory3LevelForView} category3Level категория 3 уровня
   * @memberof FilterComponent
   */
  public select3LevelCategory(category3Level: ICategory3LevelForView): void {
    category3Level.checked = !category3Level.checked;

    const category1Level = this.categories1Level.find((cat1Level: ICategory1LevelForView) => {
      const category2Level = cat1Level.categories2Level.find((cat2Level: ICategory2LevelForView) => {
        return cat2Level.categories3Level.find((cat3Level: ICategory3LevelForView) => {
          return cat3Level.id === category3Level.id;
        });
      });
      if (category2Level) {
        category2Level.checked = category2Level.categories3Level.every((cat3: ICategory3LevelForView) => cat3.checked);
        return cat1Level;
      }
      return undefined;
    });

    if (category1Level) {
      category1Level.checked = category1Level.categories2Level.every((cat2: ICategory2LevelForView) => {
        return cat2.checked;
      });
    }

    this.checkSelectedCategories3Level();
  }

  /**
   * Проверить выбранные категории 3 уровня (если сет из id категори1 3 уровня изменился, кидает событие в сервис)
   * @memberof FilterComponent
   */
  public checkSelectedCategories3Level(): void {
    const setSelected: Set<string> = new Set<string>();

    for (const category1Level of this.categories1Level) {
      for (const category2Level of category1Level.categories2Level) {
        for (const category3Level of category2Level.categories3Level) {
          // eslint-disable-next-line max-depth
          if (category3Level.checked) {
            setSelected.add(category3Level.id);
          }
        }
      }
    }

    if (this.setChechedCategory3LevelIds.size !== setSelected.size) {
      this.setChechedCategory3LevelIds = setSelected;
      this.filterService.chechedCategory3LevelIds$.next(this.setChechedCategory3LevelIds);
    }
  }

  /**
   * Функция trackBy для категорий 1 уровня
   * @param {number} index индекс
   * @param {ICategory1LevelForView} item категория 1 уровня для отображения
   * @return {*}  {string} id категории
   * @memberof FilterComponent
   */
  public trackByCategory1LevelFn(index: number, item: ICategory1LevelForView): string {   
    return item.id ?? index;
  }

  /**
   * Функция trackBy для категорий 2 уровня
   * @param {number} index индекс
   * @param {ICategory2LevelForView} item категория 2 уровня для отображения
   * @return {*}  {string} id категории
   * @memberof FilterComponent
   */
  public trackByCategory2LevelFn(index: number, item: ICategory2LevelForView): string {   
    return item.id ?? index;
  }

  /**
   * Функция trackBy для категорий 3 уровня
   * @param {number} index индекс
   * @param {ICategory3LevelForView} item категория 3 уровня для отображения
   * @return {*}  {string} id категории
   * @memberof FilterComponent
   */
  public trackByCategory3LevelFn(index: number, item: ICategory3LevelForView): string {   
    return item.id ?? index;
  }
}
