import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'main-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  public ngOnInit(): void {
    console.log('menu component')
  }

}
