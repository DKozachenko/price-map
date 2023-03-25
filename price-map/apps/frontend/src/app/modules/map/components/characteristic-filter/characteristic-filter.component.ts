import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IFilter, IResponseData, IUserFilter } from '@core/interfaces';
import { Component, OnInit } from '@angular/core';
import { RangeFilterIndex } from '@core/types';
import { NotificationService, WebSocketService } from '../../../../services';
import { FilterService } from '../../services';
import { Category3Level } from '@core/entities';
import { CategoryEvents } from '@core/enums';

/**
 * Компонент фильтра для определенной категории 3 уровня
 * @export
 * @class CharacteristicFilterComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'map-characteristic-filter',
  templateUrl: './characteristic-filter.component.html',
  styleUrls: ['./characteristic-filter.component.scss'],
})
export class CharacteristicFilterComponent implements OnInit {
  /**
   * Текущий фильтр
   * @private
   * @type {IUserFilter[]}
   * @memberof CharacteristicFilterComponent
   */
  private currentFilter: IUserFilter[] = [];

  /**
   * Категория 3 уровня, для которой нужны фильтры
   * @type {*}
   * @memberof CharacteristicFilterComponent
   */
  public category3Level: Category3Level;

  constructor(private readonly filterService: FilterService,
    private readonly webSocketSevice: WebSocketService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.filterService.chechedCategory3LevelIds$
      .pipe(untilDestroyed(this))
      .subscribe((set: Set<string>) => {
        const id: string = [...set][0];
        this.webSocketSevice.emit<string>(CategoryEvents.GetCategory3LevelAttempt, id);
      });

    this.webSocketSevice.on<IResponseData<null>>(CategoryEvents.GetCategory3LevelFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));


    this.webSocketSevice.on<IResponseData<Category3Level>>(CategoryEvents.GetCategory3LevelSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Category3Level>) => this.category3Level = response.data);
  }

  /**
   * Изменение фильтра с типом "boolean"
   * @param {IFilter} filter фильтр
   * @param {(boolean | null)} value новое значение
   * @memberof CharacteristicFilterComponent
   */
  public changeBooleanFilter(filter: IFilter, value: boolean | null): void {
    const filterElem: IUserFilter | undefined = this.currentFilter.find((currentFilterElem: IUserFilter) =>
      currentFilterElem.name === filter.name);

    if (filterElem && value) {
      filterElem.value = value;
    } else if (filterElem && value === null) {
      this.currentFilter = this.currentFilter.filter((item: IUserFilter) => item.name !== filterElem.name);
    } else if (value === true || value === false) {
      this.currentFilter.push({
        name: filter.name,
        type: filter.type,
        value
      });
    }

    this.filterService.emitSettingFilterValues(this.currentFilter);
  }

  /**
   * Измерение фильтра с типом "range"
   * @param {IFilter} filter фильтр
   * @param {RangeFilterIndex} index индекс
   * @param {Event} event событие
   * @memberof CharacteristicFilterComponent
   */
  public changeRangeFilter(filter: IFilter, index: RangeFilterIndex, event: Event): void {
    const filterElem: IUserFilter | undefined = this.currentFilter.find((currentFilterElem: IUserFilter) =>
      currentFilterElem.name === filter.name);
    const value: string = (event.target as HTMLInputElement).value;

    if (filterElem) {
      const filterElemValue: (number | null)[] = <(number | null)[]>filterElem.value;
      filterElemValue[index] = value ? +value : null;
      if (!filterElemValue[0]?.toString().length && !filterElemValue[1]?.toString().length) {
        this.currentFilter = this.currentFilter.filter((item: IUserFilter) => item.name !== filterElem.name);
      }
    } else {
      const filterValue: any = {
        name: filter.name,
        type: filter.type,
        value: [
          null,
          null
        ]
      };

      filterValue.value[index] = +value;
      this.currentFilter.push(filterValue);
    }

    this.filterService.emitSettingFilterValues(this.currentFilter);
  }

  /**
   * Изменение фильтра с типом "enum"
   * @param {IFilter} filter фильтр
   * @param {string} value новое значение
   * @memberof CharacteristicFilterComponent
   */
  public changeEnumFilter(filter: IFilter, value: string): void {
    const filterElem: IUserFilter | undefined = this.currentFilter.find((currentFilterElem: IUserFilter) =>
      currentFilterElem.name === filter.name);

    if (filterElem) {
      const filterValue: string | undefined = (<string[]>filterElem.value)?.find((item: string) => item === value);

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
        type: filter.type,
        value: [value]
      };

      this.currentFilter.push(filterValue);
    }

    this.filterService.emitSettingFilterValues(this.currentFilter);
  }

  /**
   * Функция trackBy для фильтров
   * @param {number} index инлекс
   * @param {IFilter} item фильтр
   * @return {*}  {string} название фильтра
   * @memberof CharacteristicFilterComponent
   */
  public trackByFilterFn(index: number, item: IFilter): string {
    return item?.name ?? index;
  }

  /**
   * Функция trackBy для значений фильтра
   * @param {number} index индекс
   * @param {(number | string)} item значение
   * @return {*}  {(number | string)} значение
   * @memberof CharacteristicFilterComponent
   */
  public trackByValueFn(index: number, item: number | string): number | string {
    return item ?? index;
  }
}
