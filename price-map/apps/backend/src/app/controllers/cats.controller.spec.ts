import { Test, TestingModule } from '@nestjs/testing';

import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let cats: TestingModule;

  beforeAll(async () => {
    cats = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "hook"', () => {
      const catsController = cats.get<CatsController>(CatsController);
      expect(catsController.getData()).toEqual('hook');
    });
  });
});
