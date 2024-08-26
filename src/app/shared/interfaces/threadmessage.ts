import { SafeHtml } from "@angular/platform-browser";

export interface ThreadMessage {
  ticketId?: string;
  messageId: string;
  message: string;
  timestamp: number;
  senderName: string;
  senderId: string;
  emoticons?: string[];
  id?: string;
  edited?: boolean;
  deleted?: boolean;
}
