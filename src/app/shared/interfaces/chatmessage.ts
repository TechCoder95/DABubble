export interface ChatMessage {
  channelId: string;
  name?: string;
  message: string;
  timestamp: number;
  sender: string;
  senderId:string;
  threadConversationId?:string[];
  emoticons?: string[];
  id?: string;
}
