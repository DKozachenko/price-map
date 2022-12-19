import { Injectable } from '@angular/core';

@Injectable()
export class TokenService {
  public setToken(token: string): void {
    localStorage.setItem('token-jwt', token);
  }

  public getToken(): string {
    return localStorage.getItem('token-jwt') ?? '';
  }

  public deleteToken(): void {
    localStorage.removeItem('token-jwt');
  }

  public hasToken(): boolean {
    return !!this.getToken();
  } 
}
