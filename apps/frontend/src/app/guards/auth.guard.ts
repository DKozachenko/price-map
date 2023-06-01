import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot} from '@angular/router';
import { TokenService } from '../services';

/**
 * Гвард для защиты роутов (проверяет наличие токена)
 * @export
 * @class AuthGuard
 * @implements {CanActivate}
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly router: Router,
    private readonly tokenService: TokenService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    /** Если нет токена или он протух - редирект на страницу входа */
    if (!this.tokenService.hasToken() || this.tokenService.isExpires()) {
      this.router.navigate(['/auth']);
      return false;
    }

    return true;
  }
}