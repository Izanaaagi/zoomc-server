import { WsException } from '@nestjs/websockets';

export class WsInvalidNameException extends WsException {
  constructor() {
    super('Invalid name provided');
  }
}
