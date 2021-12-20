import { Socket } from 'socket.io';

export interface SocketWithName extends Socket {
  username?: string;
}
