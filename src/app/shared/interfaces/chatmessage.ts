import { ThreadMessage } from "./threadmessage";

export interface ChatMessage {
  channelId: string;
  channelName?: string;
  message: string;
  timestamp: number;
  senderName: string;
  senderId: string;
  allConversations?: ThreadMessage[];
  id?: string;
  edited?: boolean;
  deleted?: boolean;
}
