export interface ThreadMessage {
    ticketId: string;
    message: string;
    timestamp: number;
    senderName: string;
    senderId: string;
    threadConversationId?: string[];
    emoticons?: string[];
    id?: string;
    edited?: boolean;
    deleted?: boolean;
  }
  