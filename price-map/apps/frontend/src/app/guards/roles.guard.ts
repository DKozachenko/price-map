import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot} from '@angular/router';
import { TokenService } from '../services';
import jwtDecode from "jwt-decode";

/**
 * Гвард для защиты роутов
 */
@Injectable({
  providedIn: 'root',
})
export class RolesGuard implements CanActivate {
  constructor(
    private router: Router,
    private tokenService: TokenService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ): boolean {
    const roles: string[] = route.data['roles'];
    const token = this.tokenService.getToken();
    const tokenWithoutBearer = token.split(' ')?.[1];
    const payload: any = jwtDecode(tokenWithoutBearer);
    const role: string = payload.role;
    console.log('roles', roles, role);
    return roles.includes(role);
  }
}