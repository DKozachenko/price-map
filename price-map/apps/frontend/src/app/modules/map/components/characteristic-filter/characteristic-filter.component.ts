import { Component, OnInit, Input } from '@angular/core';
import { FilterService } from '../../services';

@Component({
  selector: 'price-map-characteristic-filter',
  templateUrl: './characteristic-filter.component.html',
  styleUrls: ['./characteristic-filter.component.scss'],
})
export class CharacteristicFilterComponent implements OnInit {
  @Input()
  public category3LevelId: string = '';

  public category3Level: any;

  public currentFilter: { name: string, value: any }[] = [];

  constructor(private readonly filterService: FilterService) {}

  public ngOnInit(): void {
    this.category3Level = this.filterService.getCategory3Level(this.category3LevelId);
  }

  public changeBooleanFilter(filter: any, value: boolean | undefined): void {
    const filterElem: any = this.currentFilter.find((currentFilterElem: any) => currentFilterElem.name === filter.name);

    if (filterElem) {
      filterElem.value = value;
    } else {
      this.currentFilter.push({
        name: filter.name,
        value
      })
    }  

    this.filterService.filterValues$.next(this.currentFilter);
  }

  public changeRangeFilter(filter: any, key: 'from' | 'to', event: Event): void {
    const filterElem: any = this.currentFilter.find((currentFilterElem: any) => currentFilterElem.name === filter.name);
    const value = (event.target as HTMLInputElement).value;

    if (filterElem) {
      filterElem.value[key] = +value;
    } else {
      const filterValue: any = {
        name: filter.name,
        value: {
          from: undefined,
          to: undefined
        }
      }

      filterValue.value[key] = +value;
      this.currentFilter.push(filterValue)
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
      }

      this.currentFilter.push(filterValue)
    }

    this.filterService.filterValues$.next(this.currentFilter);
  }
}
