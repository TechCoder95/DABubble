import { ChatMessage } from './chatmessage';

export interface TextChannel {
  id: string;
  name: string;
  description: string;
  owner: string;
  assignedUser: string[];
  isPrivate: boolean;
  uid?: string;
}
