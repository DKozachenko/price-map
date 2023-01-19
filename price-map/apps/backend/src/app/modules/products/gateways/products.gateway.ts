import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../../decorators';
import { Role } from '@price-map/core/enums';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';
import { IResponseData } from '@price-map/core/interfaces';
import { Product } from '@price-map/core/entities';
import { ProductsService } from '../services';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class ProductsGateway {
  constructor (private readonly productsService: ProductsService) {}

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard('get products failed'), RolesAuthGuard('get products failed'))
  @SubscribeMessage('get products attempt')
  public async getAll(): Promise<WsResponse<IResponseData<Product[]>>> {
    const products: Product[] = await this.productsService.getAll();

    return {
      event: 'get products successed',
      data: {
        statusCode: 200,
        error: false,
        data: products,
        message: 'Товары успешно получены'
      }
    };
  }
}
