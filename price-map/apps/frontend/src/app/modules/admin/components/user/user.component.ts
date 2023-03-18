import { SettingsService } from './../../../../services';
import { Component, Input, OnInit } from '@angular/core';
import { User } from '@core/entities';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'price-map-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @Input() user: User | null = null;
  public isCurrentUser: boolean = false;

  constructor(private readonly settingsService: SettingsService) {}

  public ngOnInit(): void {
    this.isCurrentUser = this.settingsService.currentUser.id === this.user?.id;
  }

  public remove(): void {
    
  }
}
