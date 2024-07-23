import { ChatMessage } from './chatmessage';

export interface TextChannel {
  id: string;
  name: string;
  description: string;
  conversationId: string[];
  owner: string;
  assignedUser: string[];
  isPrivate: boolean;
}
