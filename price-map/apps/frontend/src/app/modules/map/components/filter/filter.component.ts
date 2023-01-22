import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Point } from 'geojson';
import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { NotificationService, WebSocketService } from '../../../../services';
import { FilterService, MapService } from '../../services';
import { Category1Level, Category2Level, Category3Level } from '@core/entities';
import { ICategory1LevelForView, ICategory2LevelForView, ICategory3LevelForView } from '../../models/interfaces';
import { IResponseData } from '@core/interfaces';
import { CategoryEvents } from '@core/enums';
import { IResponseCallback } from '../../../../models/interfaces';

@Component({
  selector: 'price-map-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
  private onGetCategories1LevelSuccessed: IResponseCallback<IResponseData<Category1Level[]>> = (response: IResponseData<Category1Level[]>) => {
    this.categories1Level = response.data.map(this.mapData);
  };

  private onGetCategories1LevelFailed: IResponseCallback<IResponseData<null>> = (response: IResponseData<null>) => {
    this.notificationService.showError(response.message);
  };

  public categories1Level: ICategory1LevelForView[] = [];
  public setChechedCategories13evel: Set<string> = new Set();

  public isShowCharacteristics: boolean = false;

  constructor(private readonly filterService: FilterService,
    private readonly webSocketSevice: WebSocketService,
    private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.webSocketSevice.on(CategoryEvents.GetCategories1LevelFailed, this.onGetCategories1LevelFailed);
    this.webSocketSevice.on(CategoryEvents.GetCategories1LevelSuccessed, this.onGetCategories1LevelSuccessed);

    this.webSocketSevice.emit<null>(CategoryEvents.GetCategories1LevelAttempt);

    this.filterService.chechedCategories3Level$
      .subscribe((data: Set<string>) => {
        this.isShowCharacteristics = data.size === 1;
      });
  }

  private mapData(categories1Level: Category1Level): ICategory1LevelForView {
    return {
      ...categories1Level,
      categories2Level: categories1Level.categories2Level.map((category2Level: Category2Level) => {
        return {
          ...category2Level,
          showCategories3Level: false,
          categories3Level: category2Level.categories3Level.map((category3Level: Category3Level) => {
            return {
              ...category3Level,
              checked: false
            };
          }),
          checked: false
        };
      }),
      showCategories2Level: false,
      checked: false
    };
  } 

  public showCategories2Level(category1Level: ICategory1LevelForView): void {
    category1Level.showCategories2Level = !category1Level.showCategories2Level;
  }

  public showCategories3Level(category2Level: ICategory2LevelForView): void {
    category2Level.showCategories3Level = !category2Level.showCategories3Level;
  }

  public select1LevelCategory(category1Level: ICategory1LevelForView): void {
    console.log(123)
    category1Level.checked = !category1Level.checked;
    if (category1Level.checked) {
      category1Level.showCategories2Level = true;
    }

    for (const cat2Level of category1Level.categories2Level) {
      if (category1Level.checked) {
        cat2Level.showCategories3Level = true;
      }

      cat2Level.checked = category1Level.checked;

      for (const cat3Level of cat2Level.categories3Level) {
        cat3Level.checked = category1Level.checked;
      }
    }
    this.checkSelectedCategories3Level();
  }

  public select2LevelCategory(category2Level: ICategory2LevelForView): void {
    category2Level.checked = !category2Level.checked;
    if (category2Level.checked) {
      category2Level.showCategories3Level = true;
    }

    for (const cat3Level of category2Level.categories3Level) {
      cat3Level.checked = category2Level.checked;
    }

    const category1Level =  this.categories1Level.find((cat1Level) => {
      const cat2Level = cat1Level.categories2Level.find((cat2Level: ICategory2LevelForView) => {
        return cat2Level.id === category2Level.id;
      });
      return cat2Level;
    });

    if (category1Level) {
      category1Level.checked = category1Level.categories2Level.every((cat2: ICategory2LevelForView) => {
        return cat2.checked;
      });
    }

    this.checkSelectedCategories3Level();
  }

  public select3LevelCategory(category3Level: ICategory3LevelForView): void {
    category3Level.checked = !category3Level.checked;

    const category1Level = this.categories1Level.find((cat1Level: ICategory1LevelForView) => {
      const category2Level = cat1Level.categories2Level.find((cat2Level: ICategory2LevelForView) => {
        return cat2Level.categories3Level.find((cat3Level: ICategory3LevelForView) => {
          return cat3Level.id === category3Level.id;
        });
      });
      if (category2Level) {
        category2Level.checked = category2Level.categories3Level.every((cat3: ICategory3LevelForView) => cat3.checked);
        return cat1Level;
      }
      return undefined;
    });

    if (category1Level) {
      category1Level.checked = category1Level.categories2Level.every((cat2: ICategory2LevelForView) => {
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
