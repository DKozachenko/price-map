import { Component, OnInit } from '@angular/core';
import { load } from '@2gis/mapgl';


@Component({
  selector: 'price-map-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    this.start()
  }

  public async start() {
    const mapglAPI = await load();

    // container — id of the div element in your html
    const map = new mapglAPI.Map('map__container', {
      center: [55.31878, 25.23584],
      zoom: 13,
      key: '111b71bc-9020-497a-8578-31790f7fcbd6',
    });

    const marker = new mapglAPI.Marker(map, {
      coordinates: [55.31878, 25.23584],
      label: {
        text: 'Здрасьте'
      }
    });
}
}
