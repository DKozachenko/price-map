import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { IPayload } from '@price-map/core/interfaces';
import { TokenService } from '../../../../services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public payload: IPayload;

  constructor(private readonly tokenService: TokenService,
    private readonly router: Router) {}

  public ngOnInit(): void {
    this.payload = this.tokenService.getPayload();
  }

  public logout(): void {
    this.tokenService.deleteToken();
    this.router.navigate(['auth'], { queryParamsHandling: 'merge' });
  }
}
