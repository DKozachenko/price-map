import { Component, OnInit } from '@angular/core';
import { load } from '@2gis/mapgl';
import { WebSocketService } from '../../services';


@Component({
  selector: 'price-map-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  constructor(private readonly webSocketSevice: WebSocketService) { }

  ngOnInit(): void {
    console.log('map component')

    this.webSocketSevice.socket.on('get users failed', (response) => {
      console.log('on get users failed', response);
      alert('Глаза разуй, дебил, данные чекни')
    });

    this.webSocketSevice.socket.on('get users successed', (response) => {
      console.log('on get users successed', response);
    });
    
    this.webSocketSevice.socket.emit('get users attempt', { temp: 1 })
  }

}
