import { Component, OnInit } from '@angular/core';
import { InputfieldComponent } from './chat-inputfield/inputfield.component';
import { ReceiveChatMessageComponent } from './receive-chat-message/receive-chat-message.component';
import { SendChatMessageComponent } from './send-chat-message/send-chat-message.component';
import { ChatService } from '../../../shared/services/chat.service';

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [
    InputfieldComponent,
    ReceiveChatMessageComponent,
    SendChatMessageComponent,
  ],
  templateUrl: './chat-conversation.component.html',
  styleUrl: './chat-conversation.component.scss',
})
export class ChatConversationComponent{

  constructor(private chatService: ChatService) {}

}
