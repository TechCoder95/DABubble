import { ChatMessage } from "./chatmessage";

export interface TextChannel {
   id: string;
   name: string;
   description: string;
   messages: ChatMessage[];
   owner: string;
   assignedUser: string[];
   isPrivate: boolean;
}
