import { Component, OnInit } from '@angular/core';
import { RouteLeg } from 'osrm';
import { PdfService, RouteService } from '../../services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService } from '../../../../../../services';

/**
 * Компонент уведомления для скачивания подробного маршрута
 * @export
 * @class RouteDownloadNotificationComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'map-route-download-notification',
  templateUrl: './route-download-notification.component.html',
  styleUrls: ['./route-download-notification.component.scss']
})
export class RouteDownloadNotificationComponent implements OnInit {
  /**
   * Маршурты между ключевыми точками
   * @private
   * @type {RouteLeg[]}
   * @memberof RouteDownloadNotificationComponent
   */
  private legs: RouteLeg[] = [];

  constructor (private readonly pdfService: PdfService,
    private readonly routeService: RouteService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.routeService.legs$
      .pipe(untilDestroyed(this))
      .subscribe((legs: RouteLeg[]) => this.legs = legs);
  }

  /**
   * Скачать подробный маршрут
   * @return {*}  {void}
   * @memberof RouteDownloadNotificationComponent
   */
  public downloadRoute(): void {
    if (!this.legs.length) {
      this.notificationService.showError('Нет маршрутов');
      return;
    }
    
    this.pdfService.dowloadFile(this.legs);
  }
}
