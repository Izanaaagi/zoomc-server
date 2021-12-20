import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { RoomsSocketsModule } from './rooms-sockets/rooms-sockets.module';

@Module({
  imports: [RoomsModule, RoomsSocketsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
