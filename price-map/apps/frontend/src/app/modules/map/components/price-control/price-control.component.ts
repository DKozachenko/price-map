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
    document.addEventListener('DOMContentLoaded', () => {
      (<any>$('#slider')).roundSlider({
        radius: 50,
        circleShape: "pie",
        sliderType: "min-range",
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
        tooltipColor: 'black',
        change: "traceEvent",
        drag: "traceEvent"
      });

      function traceEvent(e: any) {
        console.log(e.type);
      }
    })
  }

  public traceEvent(e: any) {
    console.log(e);
  }
}
