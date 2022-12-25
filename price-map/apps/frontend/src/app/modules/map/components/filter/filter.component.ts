import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Point } from 'geojson';
import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { WebSocketService } from '../../../../services';
import { FilterService, MapService } from '../../services';

@Component({
  selector: 'price-map-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
  public categories1Level: any[] = [];
  public setChechedCategories13evel: Set<string> = new Set();

  constructor(private readonly filterService: FilterService) {}

  ngOnInit(): void {
    this.categories1Level = this.filterService.categories1Level.map((cat1Level) => {
      return {
        ...cat1Level,
        categories2Level: cat1Level.categories2Level.map((cat2Level: any) => {
          return {
            ...cat2Level,
            showCategories3Level: false,
            categories3Level: cat2Level.categories3Level.map((cat3Level: any) => {
              return {
                ...cat3Level,
                checked: false
              }
            }),
            checked: false
          }
        }),
        showCategories2Level: false,
        checked: false
      }
    })
  }

  public showCategories2Level(category1Level: any): void {
    category1Level.showCategories2Level = !category1Level.showCategories2Level;
  }

  public showCategories3Level(category2Level: any): void {
    category2Level.showCategories3Level = !category2Level.showCategories3Level;
  }

  public select1LevelCategory(cat: any): void {
    cat.checked = !cat.checked;
    if (cat.checked) {
      cat.showCategories2Level = true;
    }

    for (const cat2Level of cat.categories2Level) {
      if (cat.checked) {
        cat2Level.showCategories3Level = true;
      }

      cat2Level.checked = cat.checked;

      for (const cat3Level of cat2Level.categories3Level) {
        cat3Level.checked = cat.checked;

        if (cat3Level.checked) {
          this.setChechedCategories13evel.add(cat3Level.id)
        } else {
          this.setChechedCategories13evel.delete(cat3Level.id);
        }
      }
    } 

    this.filterService.chechedCategories3Level$.next(this.setChechedCategories13evel);
  }

  public select2LevelCategory(cat: any): void {
    cat.checked = !cat.checked;
    if (cat.checked) {
      cat.showCategories3Level = true;
    }

    for (const cat3Level of cat.categories3Level) {
      if (cat.checked) {
        cat3Level.showCategories3Level = true;
      }

      if (cat.checked) {
        this.setChechedCategories13evel.add(cat3Level.id)
      } else {
        this.setChechedCategories13evel.delete(cat3Level.id);
      }

      cat3Level.checked = cat.checked;
    } 

    this.filterService.chechedCategories3Level$.next(this.setChechedCategories13evel);

    const category1Level =  this.categories1Level.find((cat1Level) => {
      const category2Level = cat1Level.categories2Level.find((cat2Level: any) => {
        return cat2Level.id === cat.id
      });
      return category2Level;
    })

    if (category1Level) {
      category1Level.checked = category1Level.categories2Level.every((cat2: any) => {
        return cat2.checked;
      });
    }
  }

  public select3LevelCategory(cat: any): void {
    cat.checked = !cat.checked;
    if (cat.checked) {
      this.setChechedCategories13evel.add(cat.id)
    } else {
      this.setChechedCategories13evel.delete(cat.id);
    }
    this.filterService.chechedCategories3Level$.next(this.setChechedCategories13evel);

    const category1Level = this.categories1Level.find((cat1Level) => {
      const category2Level = cat1Level.categories2Level.find((cat2Level: any) => {
        return cat2Level.categories3Level.find((cat3Level: any) => {
          return cat3Level.id === cat.id
        })
      });
      if (category2Level) {
        category2Level.checked = category2Level.categories3Level.every((cat3: any) => cat3.checked);
        return cat1Level;
      }
      return undefined;
    })

    if (category1Level) {
      category1Level.checked = category1Level.categories2Level.every((cat2: any) => {
        return cat2.checked;
      });
    }
  }
}
