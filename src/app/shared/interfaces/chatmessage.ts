import { SafeHtml } from '@angular/platform-browser';
import { DABubbleUser } from './user';

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
  fileUrl?: string;
  fileName?: string;
  linkedUsers: string[];
  isThreadMsg?: boolean;
}