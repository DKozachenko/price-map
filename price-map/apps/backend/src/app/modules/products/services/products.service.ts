import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@core/entities';
import { Any, In, Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  @InjectRepository(Product, 'postgresConnect')
  private readonly productRepository: Repository<Product>;

  async getAll(query: any): Promise<Product[]> {
    console.log(query);
    return await this.productRepository.find({
      where: {
        category3Level: {
          id: In(query)
        }
      },
      relations: {
        shop: true,
        category3Level: true
      }
    });
  }

  async getById(id: string): Promise<Product> {
    return await this.productRepository.findOne({
      where: {
        id
      },
      relations: {
        shop: true,
        category3Level: true
      }
    });
  }
}
