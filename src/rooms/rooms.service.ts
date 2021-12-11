import { Injectable } from '@nestjs/common';
import { Room } from './interfaces/room';
import { randomUUID } from 'crypto';

@Injectable()
export class RoomsService {
  createRoomId(): Room {
    return { roomId: randomUUID() };
  }
}
