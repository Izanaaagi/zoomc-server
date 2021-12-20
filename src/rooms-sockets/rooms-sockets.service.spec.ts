import { Test, TestingModule } from '@nestjs/testing';
import { RoomsSocketsService } from './rooms-sockets.service';

describe('RoomsSocketsService', () => {
  let service: RoomsSocketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsSocketsService],
    }).compile();

    service = module.get<RoomsSocketsService>(RoomsSocketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
