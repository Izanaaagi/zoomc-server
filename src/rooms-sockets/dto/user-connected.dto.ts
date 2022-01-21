export interface UserConnectedDto {
  id?: string;
  peerId: string;
  roomId: string;
  isVoiceOn: boolean;
  isCameraOn: boolean;
}
