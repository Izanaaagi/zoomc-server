import { IsUUID } from 'class-validator';

export class Room {
  @IsUUID()
  roomId: string;
}
