import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@core/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  @InjectRepository(Product, 'postgresConnect')
  private readonly productRepository: Repository<Product>;

  async getAll(): Promise<Product[]> {
    return await this.productRepository.find({
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
