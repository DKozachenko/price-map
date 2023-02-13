import { FilterService } from './../../services';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import 'round-slider';

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
    // Без подписки на DOMContentLoaded не работает
    document.addEventListener('DOMContentLoaded', () => {
      const slider: JQuery<HTMLDivElement> = $('#slider');
      (<any>slider).roundSlider({
        radius: 50,
        circleShape: 'pie',
        sliderType: 'min-range',
        showTooltip: true,
        editableTooltip: false,
        handleSize: '+7',
        startAngle: 315,
        svgMode: true,
        width: 10,
        min: 50,
        max: 156000,
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
    const price: number = e.options.value;
    this.filterService.addPriceQuery({
      max: price,
      min: null
    });
  }
}
