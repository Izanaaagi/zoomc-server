import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
} from '@nestjs/common';
import { WsInvalidNameException } from '../exceptions/ws-invalid-name.exception';
import { EventEmit } from '../enums/event-emit';
import { Socket } from 'socket.io';

@Catch(WsException, HttpException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const client: Socket = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  handleError(client, exception: WsException | HttpException) {
    if (exception instanceof BadRequestException) {
      client.emit(EventEmit.ERROR, 'Incorrect room key');
    } else if (exception instanceof WsInvalidNameException) {
      client.emit(EventEmit.ERROR, 'Incorrect username');
    }
  }
}
