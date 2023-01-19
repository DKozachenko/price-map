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
  public get currentCategory3LevelId() {
    return [...this.setChechedCategories13evel][0];
  }

  public isShowCharacteristics: boolean = false;

  constructor(private readonly filterService: FilterService,
    private readonly webSocketSevice: WebSocketService) {}

  ngOnInit(): void {
    this.webSocketSevice.socket.on('get categories 1 level failed', (response) => {
      console.log(123);
      console.log('on get products failed', response);
    });

    this.webSocketSevice.socket.on('get categories 1 level successed', (response) => {
      console.log('on get products successed', response);
      console.log(response.data);

      this.categories1Level = response.data.map((cat1Level: any) => {
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
                };
              }),
              checked: false
            };
          }),
          showCategories2Level: false,
          checked: false
        };
      });
    });

    this.webSocketSevice.addToken();
    this.webSocketSevice.socket.emit('get categories 1 level attempt');



    this.filterService.chechedCategories3Level$
      .subscribe((data: Set<string>) => {
        this.isShowCharacteristics = data.size === 1;
        console.log(this.currentCategory3LevelId);
        // this.currentCategory3LevelId = this.isShowCharacteristics ? [...data][0] : undefined;
      });
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
      }
    }
    this.checkSelectedCategories3Level();
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

      cat3Level.checked = cat.checked;
    }

    const category1Level =  this.categories1Level.find((cat1Level) => {
      const category2Level = cat1Level.categories2Level.find((cat2Level: any) => {
        return cat2Level.id === cat.id;
      });
      return category2Level;
    });

    if (category1Level) {
      category1Level.checked = category1Level.categories2Level.every((cat2: any) => {
        return cat2.checked;
      });
    }

    this.checkSelectedCategories3Level();
  }

  public select3LevelCategory(cat: any): void {
    cat.checked = !cat.checked;

    const category1Level = this.categories1Level.find((cat1Level) => {
      const category2Level = cat1Level.categories2Level.find((cat2Level: any) => {
        return cat2Level.categories3Level.find((cat3Level: any) => {
          return cat3Level.id === cat.id;
        });
      });
      if (category2Level) {
        category2Level.checked = category2Level.categories3Level.every((cat3: any) => cat3.checked);
        return cat1Level;
      }
      return undefined;
    });

    if (category1Level) {
      category1Level.checked = category1Level.categories2Level.every((cat2: any) => {
        return cat2.checked;
      });
    }

    this.checkSelectedCategories3Level();
  }

  public checkSelectedCategories3Level(): void {
    const setSelected: Set<string> = new Set<string>();

    for (const category1Level of this.categories1Level) {
      for (const category2Level of category1Level.categories2Level) {
        for (const category3Level of category2Level.categories3Level) {
          // eslint-disable-next-line max-depth
          if (category3Level.checked) {
            setSelected.add(category3Level.id);
          }
        }
      }
    }

    if (this.setChechedCategories13evel.size !== setSelected.size) {
      this.setChechedCategories13evel = setSelected;
      this.filterService.chechedCategories3Level$.next(this.setChechedCategories13evel);
    }
  }
}
