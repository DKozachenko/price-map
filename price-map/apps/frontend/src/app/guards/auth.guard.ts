import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot} from '@angular/router';
import { TokenService } from '../services';

/**
 * Гвард для защиты роутов
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private tokenService: TokenService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ): boolean {
    /** Если нет токена - редирект на страницу входа */
    if (this.tokenService.hasToken()) {
      return true;
    }

    //TODO: какие-нибудь параметры для оповещения, что нет токена
    this.router.navigate(['/auth']);
    return false;
  }
}