import { Test, TestingModule } from '@nestjs/testing';
import { RoomsSocketsGateway } from './rooms-sockets.gateway';
import { RoomsSocketsService } from './rooms-sockets.service';

describe('RoomsSocketsGateway', () => {
  let gateway: RoomsSocketsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsSocketsGateway, RoomsSocketsService],
    }).compile();

    gateway = module.get<RoomsSocketsGateway>(RoomsSocketsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
