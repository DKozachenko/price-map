import { Module} from '@nestjs/common';
import { ExternalService } from './services';
import { ExternalGateway } from './gateways';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';

/**
 * Модуль для взаимодействия с внешними системами (OSRM, OSM API)
 * @export
 * @class ExternalModule
 */
@Module({
  imports: [HttpModule],
  providers: [
    ExternalService,
    ExternalGateway,
    JwtService
  ],
})
export class ExternalModule {}
