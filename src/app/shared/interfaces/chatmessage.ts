export interface Chatmessage {

    id: number;
    message: string;
    sender: string;
    time: string;
    type: string;
    status: string;
    isMe?: boolean;
    isRead?: boolean;
    isDelivered: boolean;
    isSent: boolean;
    isPending: boolean;
    isFailed: boolean;
    isSeen: boolean;
    isTyping: boolean;
    isRecording: boolean;
    isAudio: boolean;
    isImage: boolean;
    isVideo: boolean;
   

}
