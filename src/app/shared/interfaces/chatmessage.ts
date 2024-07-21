export interface ChatMessage {
    channelId: string;
    name?: string; 
    message: string;
    timestamp: Date;
    sender: string;
    emoticons?: string[];
}