import { FilterService } from './../../services';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import 'round-slider';
import { IPriceQuery } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'map-price-control',
  templateUrl: './price-control.component.html',
  styleUrls: ['./price-control.component.scss']
})
export class PriceControlComponent implements OnInit {
  private slider: JQuery<HTMLDivElement>;
  public filterService: FilterService;

  public ngOnInit(): void {
    this.initSlider();
  }

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
    console.log(2, this.slider)

    //Теряет контекст, поэтому напрямую передаем
    this.slider.on('change', this.changePrice.bind(this));
  }


  private initSlider(): void {
    this.filterService.initialPriceQuery$
      .pipe(untilDestroyed(this))
      .subscribe((initialPriceQuery: IPriceQuery) => {
        this.setSlider(initialPriceQuery);
        //Очень тупой хак, так почему-то при повторых переключениях на слой товаров не инициализируется слайдер
        if (!this.slider?.[0]) {
          console.log(3)
          setTimeout(() => {
            this.setSlider(initialPriceQuery);
          }, 0);
        }
      });
  }

  private changePrice(e: any) {
    const initialPriceQuery: IPriceQuery = {
      min: e.options.min,
      max: e.options.max
    };
    const currentPriceQuery: IPriceQuery = {
      min: +(<string>e.options.value).split(',')[0],
      max: +(<string>e.options.value).split(',')[1]
    };
    this.filterService.addPriceQuery({
      max: currentPriceQuery.max === initialPriceQuery.max ? null : currentPriceQuery.max,
      min: currentPriceQuery.min === initialPriceQuery.min ? null : currentPriceQuery.min
    });
  }

  public destroySlider(): void {
    (<any>this.slider).roundSlider('destroy');
  }
}
