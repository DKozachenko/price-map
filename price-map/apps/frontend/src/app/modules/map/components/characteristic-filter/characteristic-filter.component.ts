import { Component, OnInit, Input } from '@angular/core';
import { RangeFilterKey } from 'libs/core/src/lib/types';
import { WebSocketService } from '../../../../services';
import { FilterService } from '../../services';

@Component({
  selector: 'price-map-characteristic-filter',
  templateUrl: './characteristic-filter.component.html',
  styleUrls: ['./characteristic-filter.component.scss'],
})
export class CharacteristicFilterComponent implements OnInit {
  @Input()
  public category3LevelId: string = '';

  @Input()
  public category3Level: any;

  public currentFilter: { name: string, value: any }[] = [];

  constructor(private readonly filterService: FilterService,
    private readonly webSocketSevice: WebSocketService) {}

  public ngOnInit(): void {
    console.warn(this.category3LevelId);
    this.webSocketSevice.socket.on('get category 3 level failed', (response) => {
      console.log(123);
      console.log('on get products failed', response);
    });

    this.webSocketSevice.socket.on('get category 3 level successed', (response) => {
      console.log('on get products successed', response);
      console.log(response.data);
      this.category3Level = response.data;
    });

    // this.webSocketSevice.addToken();
    this.webSocketSevice.socket.emit('get category 3 level attempt', { id: this.category3LevelId });
  }

  public changeBooleanFilter(filter: any, value: boolean | null): void {
    const filterElem: any = this.currentFilter.find((currentFilterElem: any) => currentFilterElem.name === filter.name);

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

  public changeRangeFilter(filter: any, key: RangeFilterKey, event: Event): void {
    const filterElem: any = this.currentFilter.find((currentFilterElem: any) => currentFilterElem.name === filter.name);
    const value = (event.target as HTMLInputElement).value;

    if (filterElem) {
      filterElem.value[key] = value ? +value : null;
    } else {
      const filterValue: any = {
        name: filter.name,
        value: {
          from: null,
          to: null
        }
      };

      filterValue.value[key] = +value;
      this.currentFilter.push(filterValue);
    }

    this.filterService.filterValues$.next(this.currentFilter);
  }

  public changeEnumFilter(filter: any, value: any): void {
    const filterElem: any = this.currentFilter.find((currentFilterElem: any) => currentFilterElem.name === filter.name);

    if (filterElem) {
      const filterValue: any = filterElem.value.find((item: any) => item === value);

      if (filterValue) {
        filterElem.value = filterElem.value.filter((item: any) => item !== value);

        if (!filterElem.value.length) {
          this.currentFilter = this.currentFilter.filter((item) => item.name !== filterElem.name);
        }
      } else {
        filterElem.value.push(value);
      }
    } else {
      const filterValue: any = {
        name: filter.name,
        value: [value]
      };

      this.currentFilter.push(filterValue);
    }

    this.filterService.filterValues$.next(this.currentFilter);
  }
}
