import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot} from '@angular/router';
import { TokenService } from '../services';
import jwtDecode from 'jwt-decode';
import { IPayload } from '@price-map/core/interfaces';

/**
 * Гвард для защиты роутов (проверяет соответствие ролей)
 * @export
 * @class RolesGuard
 * @implements {CanActivate}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private router: Router,
    private tokenService: TokenService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ): boolean {
    const roles: string[] = route.data['roles'];
    const token: string = this.tokenService.getToken();
    const tokenWithoutBearer: string = token.split(' ')?.[1];
    
    const payload: IPayload = jwtDecode(tokenWithoutBearer);
    const role: string = payload.role;
    if (roles.includes(role)) {
      return true;
    }

    this.router.navigate(['/auth']);
    return false;
  }
}
