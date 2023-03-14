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
  public filterService: FilterService;

  public ngOnInit(): void {
    this.initSlider();
  }

  private initSlider(): void {
    this.filterService.initialPriceQuery$
      .pipe(untilDestroyed(this))
      .subscribe((initialPriceQuery: IPriceQuery) => {
        const slider: JQuery<HTMLDivElement> = $('#slider');
        (<any>slider).roundSlider({
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
        slider.on('change', this.changePrice.bind(this));
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
}
