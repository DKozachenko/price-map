import { FilterService } from './../../services';
import { Component, OnInit } from '@angular/core';
import { IPriceQuery } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { asapScheduler, observeOn } from 'rxjs';
import * as $ from 'jquery';
import 'round-slider';

/**
 * Компонент для контрола цены
 * @export
 * @class PriceControlComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'map-price-control',
  templateUrl: './price-control.component.html',
  styleUrls: ['./price-control.component.scss']
})
export class PriceControlComponent implements OnInit {
  /**
   * Слайдер
   * @private
   * @type {JQuery<HTMLDivElement>}
   * @memberof PriceControlComponent
   */
  private slider: JQuery<HTMLDivElement>;

  /**
   * Сервис фильтра
   * @type {FilterService}
   * @memberof PriceControlComponent
   */
  public filterService: FilterService;

  public ngOnInit(): void {
    this.initSlider();
  }

  /**
   * Установка слайдера
   * @private
   * @param {IPriceQuery} initialPriceQuery начальное значение мин / макс цен
   * @memberof PriceControlComponent
   */
  private setSlider(initialPriceQuery: IPriceQuery): void {
    this.slider = $('#slider');
    (<any>this.slider).roundSlider({
      radius: 50,
      circleShape: 'pie',
      sliderType: 'range',
      showTooltip: true,
      editableTooltip: false,
      handleSize: '+7',
      startAngle: 315,
      svgMode: true,
      width: 10,
      min: initialPriceQuery.min,
      max: initialPriceQuery.max,
      value: `${initialPriceQuery.min},${initialPriceQuery.max}`,
      borderWidth: 0,
      pathColor: 'white',
      rangeColor: '#a16eff',
      tooltipColor: 'black'
    });

    //Теряет контекст, поэтому напрямую передаем
    this.slider.on('change', this.changePrice.bind(this));
  }

  /**
   * Инициализация слайдера
   * @private
   * @memberof PriceControlComponent
   */
  private initSlider(): void {
    //Всегда запускаем как микрозадачу, так почему-то при некоторых повторых переключениях на слой товаров не инициализируется слайдер
    this.filterService.initialPriceQuery$
      .pipe(observeOn(asapScheduler), untilDestroyed(this))
      .subscribe((initialPriceQuery: IPriceQuery) => this.setSlider(initialPriceQuery));
  }

  /**
   * Изменение фильтра
   * @private
   * @param {*} e событие слайдера
   * @memberof PriceControlComponent
   */
  private changePrice(e: any) {
    const initialPriceQuery: IPriceQuery = {
      min: e.options.min,
      max: e.options.max
    };
    const currentPriceQuery: IPriceQuery = {
      min: +(<string>e.options.value).split(',')[0],
      max: +(<string>e.options.value).split(',')[1]
    };
    this.filterService.emitSettingPriceQuery({
      max: currentPriceQuery.max === initialPriceQuery.max ? null : currentPriceQuery.max,
      min: currentPriceQuery.min === initialPriceQuery.min ? null : currentPriceQuery.min
    });
  }

  /**
   * Удалить слайдер
   * @memberof PriceControlComponent
   */
  public destroySlider(): void {
    (<any>this.slider).roundSlider('destroy');
  }
}
