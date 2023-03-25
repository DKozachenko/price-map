import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@core/entities';
import { TokenService } from '../../../../services';

@Component({
  selector: 'main-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Input() public currentUser: User | null = null;
  public isMenuBtnActive: boolean = false;
  public isMenuActive: boolean = false;

  constructor (private readonly tokenService: TokenService,
    private router: Router) {}

  public toggleMenu(event: Event): void {
    event.preventDefault();
    this.isMenuBtnActive = !this.isMenuBtnActive;
    this.isMenuActive = !this.isMenuActive;
  }

  public logout(event: Event): void {
    event.preventDefault();
    this.tokenService.deleteToken();
    this.router.navigate(['auth'], { queryParamsHandling: 'merge' });
  }

  public goTo(link: string): void {
    this.isMenuActive = false;
    this.isMenuBtnActive = false;
    this.router.navigate([link], { queryParamsHandling: 'merge' });
  }

}
