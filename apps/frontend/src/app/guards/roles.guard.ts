import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot} from '@angular/router';
import { TokenService } from '../services';
import { IPayload } from '@core/interfaces';

/**
 * Гвард для защиты роутов (проверяет соответствие ролей)
 * @export
 * @class RolesGuard
 * @implements {CanActivate}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly router: Router,
    private readonly tokenService: TokenService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const roles: string[] = route.data['roles'];    
    const payload: IPayload = this.tokenService.getPayload();
    const currentRole: string = payload.role;
    if (roles.includes(currentRole)) {
      return true;
    }

    this.router.navigate(['/auth']);
    return false;
  }
}
