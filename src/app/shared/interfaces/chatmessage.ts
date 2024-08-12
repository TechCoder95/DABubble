export interface ChatMessage {
  channelId: string;
  channelName?: string;
  message: string;
  timestamp: number;
  senderName: string;
  senderId: string;
  threadConversationId?: string[];
  id?: string;
  edited?: boolean;
  deleted?: boolean;
}
