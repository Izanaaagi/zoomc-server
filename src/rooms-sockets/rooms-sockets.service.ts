import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { parse } from 'cookie';
import { RoomParticipant } from './interfaces/room-participant';
import { SocketWithName } from './interfaces/socket-with-name';
import { isUUID } from '@nestjs/common/utils/is-uuid';
import { WsInvalidNameException } from './exceptions/ws-invalid-name.exception';

@Injectable()
export class RoomsSocketsService {
  getNameFromSocket(socket: Socket): string {
    const cookie = socket.handshake.headers.cookie;
    const { username } = parse(cookie);
    return username;
  }

  getParticipantsArray(server: Server, roomId: string): Array<RoomParticipant> {
    const room: Set<string> = server.sockets.adapter.rooms.get(roomId);
    const roomParticipants: Array<RoomParticipant> = [];

    if (!room) {
      throw new WsInvalidNameException();
    }

    room.forEach((socketId) => {
      const clientSocket: SocketWithName = server.sockets.sockets.get(socketId);
      const participant: RoomParticipant = {
        id: clientSocket.id,
        username: clientSocket.username,
      };
      roomParticipants.push(participant);
    });

    return roomParticipants;
  }

  getUUIDRooms(server: Server): Array<string> {
    const rooms: Map<string, Set<string>> = server.sockets.adapter.rooms;
    const UUIDRooms: Array<string> = [...rooms.keys()].filter(
      (roomName: string) => isUUID(roomName),
    );
    return UUIDRooms;
  }
}
