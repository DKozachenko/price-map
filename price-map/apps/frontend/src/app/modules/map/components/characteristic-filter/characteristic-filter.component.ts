import { IFilter, IResponseData, IUserFilter } from '@core/interfaces';
import { Component, OnInit } from '@angular/core';
import { RangeFilterIndex } from 'libs/core/src/lib/types';
import { NotificationService, WebSocketService } from '../../../../services';
import { FilterService } from '../../services';
import { Category3Level } from '@core/entities';
import { CategoryEvents } from '@core/enums';
import { IResponseCallback } from '../../../../models/interfaces';

/**
 * Компонент фильтра для определенной категории 3 уровня
 * @export
 * @class CharacteristicFilterComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'price-map-characteristic-filter',
  templateUrl: './characteristic-filter.component.html',
  styleUrls: ['./characteristic-filter.component.scss'],
})
export class CharacteristicFilterComponent implements OnInit {
  /**
   * Колбэк, срабатывающий при успешном получении категории
   * @private
   * @param {IResponseData<Category3Level>} response
   * @type {IResponseCallback<IResponseData<Category3Level>>}
   * @memberof CharacteristicFilterComponent
   */
  private onGetCategory3LevelSuccessed: IResponseCallback<IResponseData<Category3Level>> = (response: IResponseData<Category3Level>) => {
    this.category3Level = response.data;
  }

  //TODO: очень похожая логика везде при неудачной попытке
  /**
   * Колбэк срабатывающий при неудачном получении категории
   * @private
   * @param {IResponseData<null>} response
   * @type {IResponseCallback<IResponseData<null>>}
   * @memberof CharacteristicFilterComponent
   */
  private onGetCategory3LevelFailed: IResponseCallback<IResponseData<null>> = (response: IResponseData<null>) => {
    this.notificationService.showError(response.message);
  }

  /**
   * Текущий фильтр
   * @private
   * @type {IUserFilter[]}
   * @memberof CharacteristicFilterComponent
   */
  private currentFilter: IUserFilter[] = [];

  //TODO: Та же проблема, ломается если тип задать
  /**
   * Категория 3 уровня, для которой нужны фильтры
   * @type {*}
   * @memberof CharacteristicFilterComponent
   */
  public category3Level: any;

  //TODO: подумать над выносом webSocketSevice и notificationService в базовый класс какой-нить (и возможно также обернуть его в UntilDestroyed)
  constructor(private readonly filterService: FilterService,
    private readonly webSocketSevice: WebSocketService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.filterService.chechedCategories3Level$.subscribe((set: Set<string>) => {
      const id: string = [...set][0];
      this.webSocketSevice.emit<string>(CategoryEvents.GetCategory3LevelAttempt, id);
    })

    this.webSocketSevice.on(CategoryEvents.GetCategory3LevelFailed, this.onGetCategory3LevelFailed);
    this.webSocketSevice.on(CategoryEvents.GetCategory3LevelSuccessed, this.onGetCategory3LevelSuccessed);
  }

  /**
   * Изменение фильтра с типом "boolean"
   * @param {IFilter} filter фильтр
   * @param {(boolean | null)} value новое значение
   * @memberof CharacteristicFilterComponent
   */
  public changeBooleanFilter(filter: IFilter, value: boolean | null): void {
    const filterElem: IUserFilter | undefined = this.currentFilter.find((currentFilterElem: IUserFilter) => currentFilterElem.name === filter.name);

    if (filterElem) {
      filterElem.value = value;
    } else {
      this.currentFilter.push({
        name: filter.name,
        value
      });
    }

    this.filterService.filterValues$.next(this.currentFilter);
  }

  /**
   * Измерение фильтра с типом "range"
   * @param {IFilter} filter фильтр
   * @param {RangeFilterIndex} index индекс
   * @param {Event} event событие
   * @memberof CharacteristicFilterComponent
   */
  public changeRangeFilter(filter: IFilter, index: RangeFilterIndex, event: Event): void {
    const filterElem: IUserFilter | undefined = this.currentFilter.find((currentFilterElem: IUserFilter) => currentFilterElem.name === filter.name);
    const value: string = (event.target as HTMLInputElement).value;

    if (filterElem) {
      const filterElemValue: (number | null)[] = <(number | null)[]>filterElem.value;
      filterElemValue[index] = value ? +value : null;
    } else {
      const filterValue: any = {
        name: filter.name,
        value: [null, null]
      };

      filterValue.value[index] = +value;
      this.currentFilter.push(filterValue);
    }

    this.filterService.filterValues$.next(this.currentFilter);
  }

  /**
   * Изменение фильтра с типом "enum" 
   * @param {IFilter} filter фильтр
   * @param {string} value новое значение
   * @memberof CharacteristicFilterComponent
   */
  public changeEnumFilter(filter: IFilter, value: string): void {
    const filterElem: IUserFilter | undefined = this.currentFilter.find((currentFilterElem: IUserFilter) => currentFilterElem.name === filter.name);

    if (filterElem) {
      const filterValue: string | undefined = (filterElem.value as Array<string>)?.find((item: string) => item === value);

      if (filterValue) {
        filterElem.value = <string[]>(filterElem.value as Array<string>)?.filter((item: string) => item !== value);

        if (!filterElem.value.length) {
          this.currentFilter = this.currentFilter.filter((item) => item.name !== filterElem.name);
        }
      } else {
        (filterElem.value as Array<string | number>)?.push(value);
      }
    } else {
      const filterValue: IUserFilter = {
        name: filter.name,
        value: [value]
      };

      this.currentFilter.push(filterValue);
    }

    this.filterService.filterValues$.next(this.currentFilter);
  }
}
