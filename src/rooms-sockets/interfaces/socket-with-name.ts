import { Socket } from 'socket.io';

export interface SocketWithName extends Socket {
  username?: string;
  roomId?: string;
  peerId?: string;
  mediaStream?: MediaStream;
}
