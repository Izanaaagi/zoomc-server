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
import { SocketWithName } from './interfaces/socket-with-name';
import { RoomParticipant } from './interfaces/room-participant';
import { EventEmit } from './enums/event-emit';
import { EventListen } from './enums/event-listen';
import { Message } from './interfaces/message';
import { randomUUID } from 'crypto';
import { MessageDto } from './dto/message.dto';
import { WsExceptionFilter } from './exception-filters/ws-exception-filter';
import { UserConnectedDto } from './dto/user-connected.dto';

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
  }

  handleDisconnect(@ConnectedSocket() socket: SocketWithName): void {
    Logger.log(`User ${socket} disconnected`);
    Logger.log(`User ${socket.username} left room ${socket.roomId}`);

    this.server
      .to(socket.roomId)
      .emit(EventEmit.USER_DISCONNECTED, socket.peerId);
  }

  @UsePipes(new ValidationPipe())
  @UseFilters(new WsExceptionFilter())
  @SubscribeMessage(EventListen.JOIN_ROOM)
  joinRoom(
    @ConnectedSocket() socket: SocketWithName,
    @MessageBody() body: UserConnectedDto,
  ): void {
    socket.username = this.roomsSocketsService.getNameFromSocket(socket);
    socket.roomId = body.roomId;
    socket.peerId = body.peerId;
    socket.join(body.roomId);
    Logger.log(`User ${socket.peerId} join to room ${body.roomId}`);

    const availableRooms: Array<string> = this.roomsSocketsService.getUUIDRooms(
      this.server,
    );
    this.server.emit(EventEmit.UPDATE_AVAILABLE_ROOMS, availableRooms);

    socket.to(body.roomId).emit(EventEmit.USER_CONNECTED, {
      peerId: socket.peerId,
      username: socket.username,
      socketId: socket.id,
      isVoiceOn: body.isVoiceOn,
      isCameraOn: body.isCameraOn,
    });
  }

  @SubscribeMessage(EventListen.LEFT_ROOM)
  leftRoom(
    @ConnectedSocket() socket: SocketWithName,
    @MessageBody() body: Pick<SocketWithName, 'peerId' | 'roomId'>,
  ) {
    socket.roomId = '';
    socket.leave(body.roomId);
    Logger.log(`User ${socket.username} left room ${body.roomId}`);

    const availableRooms: Array<string> = this.roomsSocketsService.getUUIDRooms(
      this.server,
    );
    this.server.emit(EventEmit.UPDATE_AVAILABLE_ROOMS, availableRooms);

    this.server.to(body.roomId).emit(EventEmit.USER_DISCONNECTED, body.peerId);
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

  @SubscribeMessage(EventListen.ANSWER)
  sendAnswer(
    @ConnectedSocket() socket: SocketWithName,
    @MessageBody() body: UserConnectedDto,
  ): void {
    this.server.to(body.id).emit(EventEmit.ANSWER, {
      peerId: body.peerId,
      username: socket.username,
      isVoiceOn: body.isVoiceOn,
      isCameraOn: body.isCameraOn,
    });
  }

  @SubscribeMessage(EventListen.TOGGLE_PARTICIPANT_VOICE)
  onToggleParticipantVoice(
    @ConnectedSocket() socket: SocketWithName,
    @MessageBody() body: Pick<SocketWithName, 'peerId'>,
  ): void {
    socket
      .to(socket.roomId)
      .emit(EventEmit.TOGGLE_PARTICIPANT_VOICE, body.peerId);
  }

  @SubscribeMessage(EventListen.TOGGLE_PARTICIPANT_CAMERA)
  onToggleParticipantCamera(
    @ConnectedSocket() socket: SocketWithName,
    @MessageBody() body: Pick<SocketWithName, 'peerId'>,
  ): void {
    socket
      .to(socket.roomId)
      .emit(EventEmit.TOGGLE_PARTICIPANT_CAMERA, body.peerId);
  }
}
