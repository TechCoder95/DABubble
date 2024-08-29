export interface ChatMessage {
  channelId: string;
  channelName?: string;
  message: string;
  timestamp: number;
  senderName: string;
  senderId: string;
  id?: string;
  edited?: boolean;
  deleted?: boolean;
  fileUrl?: string;
  fileName?: string;
  isThreadMsg?: boolean;
  replyNumber: number;
  lastRepliedTime: number;
}