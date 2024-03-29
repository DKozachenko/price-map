import { IAppInitializer } from './../models/interfaces';
import { of } from 'rxjs';
import { WebSocketService } from '../services';

/**
 * Инициализатор приложения
 * @export
 */
export const appInitializer: IAppInitializer = (webSocketService: WebSocketService) => 
  () => of(webSocketService.initSocket());