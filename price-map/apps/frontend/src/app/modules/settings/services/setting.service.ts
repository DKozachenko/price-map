import { Injectable } from '@angular/core';
import { User } from '@core/entities';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable()
export class SettingService {
  public user: User | null = null;

  public setUser(user: User) {
    if (user) {
      this.user = user;
    }
  }
}