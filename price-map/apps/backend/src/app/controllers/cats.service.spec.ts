import { Test } from '@nestjs/testing';

import { CatsService } from './cats.service';

describe('CatsService', () => {
  let service: CatsService;

  beforeAll(async () => {
    const cats = await Test.createTestingModule({
      providers: [CatsService],
    }).compile();

    service = cats.get<CatsService>(CatsService);
  });

  describe('getData', () => {
    it('should return "Welcome to backend!"', () => {
      expect(service.getData()).toEqual({ message: 'Welcome to backend!' });
    });
  });
});
