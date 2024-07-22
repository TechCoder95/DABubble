import { ChatMessage } from "./chatmessage";

export interface TextChannel {
   id: string;
   name: string;
   description: string;
   messages: ChatMessage[];
   owner: string;
   zugewieseneUser: string[];
   isPrivate: boolean;
}
