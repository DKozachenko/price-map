import { Observable } from 'rxjs';
import { WebSocketService } from '../../services';

/**
 * Интерфейс инициализатора приложения
 * @export
 * @interface IAppInitializer
 */
export interface IAppInitializer {
  (webSocketService: WebSocketService): () => Observable<void>;
}