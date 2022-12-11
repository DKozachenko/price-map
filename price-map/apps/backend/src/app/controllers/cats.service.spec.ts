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
    it('should return "hook"', () => {
      expect(service.getData()).toEqual('hook');
    });
  });
});
