export interface ChatMessage {
  channelId: string;
  name?: string;
  message: string;
  timestamp: number;
  sender: string;
  senderId:string;
  emoticons?: string[];
  id?: string;
}
