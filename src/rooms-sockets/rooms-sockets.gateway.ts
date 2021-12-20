import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { RoomsSocketsService } from './rooms-sockets.service';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Room } from '../rooms/interfaces/room';
import { SocketWithName } from './interfaces/socket-with-name';
import { RoomParticipant } from './interfaces/room-participant';
import { EventEmit } from './enums/event-emit';
import { EventListen } from './enums/event-listen';
import { Message } from './interfaces/message';
import { randomUUID } from 'crypto';
import { MessageDto } from './dto/message.dto';
import { WsExceptionFilter } from './exception-filters/ws-exception-filter';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
})
export class RoomsSocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly roomsSocketsService: RoomsSocketsService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() socket: Socket): void {
    Logger.log(`User ${socket} connected`);
    console.log(this.roomsSocketsService.getUUIDRooms(this.server));
  }

  handleDisconnect(@ConnectedSocket() socket: Socket): void {
    Logger.log(`User ${socket} disconnected`);
  }

  @UsePipes(new ValidationPipe())
  @UseFilters(new WsExceptionFilter())
  @SubscribeMessage(EventListen.JOIN_ROOM)
  joinRoom(
    @ConnectedSocket() socket: SocketWithName,
    @MessageBody() body: Room,
  ): void {
    socket.username = this.roomsSocketsService.getNameFromSocket(socket);
    socket.join(body.roomId);
    Logger.log(`User ${socket.username} join to room ${body.roomId}`);

    const roomParticipants: Array<RoomParticipant> =
      this.roomsSocketsService.getParticipantsArray(this.server, body.roomId);
    const availableRooms: Array<string> = this.roomsSocketsService.getUUIDRooms(
      this.server,
    );

    this.server.emit(EventEmit.UPDATE_AVAILABLE_ROOMS, availableRooms);

    this.server
      .to(body.roomId)
      .emit(EventEmit.UPDATE_PARTICIPANTS, roomParticipants);
  }

  @SubscribeMessage(EventListen.LEFT_ROOM)
  leftRoom(
    @ConnectedSocket() socket: SocketWithName,
    @MessageBody() body: Room,
  ) {
    socket.leave(body.roomId);
    Logger.log(`User ${socket.username} left room ${body.roomId}`);

    const roomParticipants: Array<RoomParticipant> =
      this.roomsSocketsService.getParticipantsArray(this.server, body.roomId);
    const availableRooms: Array<string> = this.roomsSocketsService.getUUIDRooms(
      this.server,
    );

    this.server.emit(EventEmit.UPDATE_AVAILABLE_ROOMS, availableRooms);

    this.server
      .to(body.roomId)
      .emit(EventEmit.UPDATE_PARTICIPANTS, roomParticipants);
  }

  @SubscribeMessage(EventListen.SEND_MESSAGE)
  sendMessage(
    @ConnectedSocket() socket: SocketWithName,
    @MessageBody() body: MessageDto,
  ) {
    Logger.log(`User ${socket.username} send message : "${body.text}"`);

    const user: RoomParticipant = { id: socket.id, username: socket.username };
    const message: Message = { id: randomUUID(), text: body.text, user };

    this.server.to(body.roomId).emit(EventEmit.RECEIVE_MESSAGE, message);
  }

  @SubscribeMessage(EventListen.REQUEST_ROOMS)
  getAvailableRooms(): void {
    const availableRooms = this.roomsSocketsService.getUUIDRooms(this.server);
    this.server.emit(EventEmit.UPDATE_AVAILABLE_ROOMS, availableRooms);
  }
}
