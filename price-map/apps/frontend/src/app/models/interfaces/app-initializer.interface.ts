import { Observable } from 'rxjs';
import { WebSocketService } from '../../services';

export interface IAppInitializer {
  (webSocketService: WebSocketService): () => Observable<void>;
}