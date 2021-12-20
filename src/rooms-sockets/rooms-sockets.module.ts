import { Module } from '@nestjs/common';
import { RoomsSocketsService } from './rooms-sockets.service';
import { RoomsSocketsGateway } from './rooms-sockets.gateway';

@Module({
  providers: [RoomsSocketsGateway, RoomsSocketsService],
})
export class RoomsSocketsModule {}
