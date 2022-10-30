import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  getData(): string {
    return 'hook';
  }
}
