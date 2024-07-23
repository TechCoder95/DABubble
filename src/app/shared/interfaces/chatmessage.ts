export interface ChatMessage {
  channelId: string;
  name?: string;
  message: string;
  timestamp: number;
  sender: string;
  emoticons?: string[];
  id?: string;
}
