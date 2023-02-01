import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { Roles } from '../../../decorators';
import { Role } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { Product } from '@core/entities';
import { ProductsService } from '../services';
import { DbErrorCode } from '@core/types';

/**
 * Шлюз товаров
 * @export
 * @class ProductsGateway
 */
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class ProductsGateway {
  constructor (private readonly productsService: ProductsService) {}

  @Roles(Role.User, Role.Admin)
  // @UseGuards(JwtAuthGuard('get products failed'), RolesAuthGuard('get products failed'))
  @SubscribeMessage('get products attempt')
  public async getAll(@MessageBody() query: any): Promise<WsResponse<IResponseData<Product[] | null, DbErrorCode | null>>> {
    const products: Product[] = await this.productsService.getAll(query ? query : []);

    return {
      event: 'get products successed',
      data: {
        statusCode: 200,
        errorCode: null,
        isError: false,
        data: products,
        message: 'Товары успешно получены'
      }
    };
  }

  @Roles(Role.User, Role.Admin)
  // @UseGuards(JwtAuthGuard('get product failed'), RolesAuthGuard('get product failed'))
  @SubscribeMessage('get product attempt')
  public async getById(@MessageBody() id: string): Promise<WsResponse<IResponseData<Product | null, DbErrorCode | null>>> {
    const product: Product = await this.productsService.getById(id);

    return {
      event: 'get product successed',
      data: {
        statusCode: 200,
        errorCode: null,
        isError: false,
        data: product,
        message: 'Товар успешно получен'
      }
    };
  }
}
