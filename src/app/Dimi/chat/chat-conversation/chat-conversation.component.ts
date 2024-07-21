import { Component, Input, OnInit, Output } from '@angular/core';
import { InputfieldComponent } from './chat-inputfield/inputfield.component';
import { ReceiveChatMessageComponent } from './receive-chat-message/receive-chat-message.component';
import { SendChatMessageComponent } from './send-chat-message/send-chat-message.component';
import { ChatService } from '../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [
    InputfieldComponent,
    ReceiveChatMessageComponent,
    SendChatMessageComponent,
    CommonModule
  ],
  templateUrl: './chat-conversation.component.html',
  styleUrl: './chat-conversation.component.scss',
})
export class ChatConversationComponent {

  activeUser! : DABubbleUser;
  constructor(private chatService: ChatService, private userService: UserService) { 
    this.activeUser = this.userService.activeUser;
  }

  receiveChatMessages: ChatMessage[] = [{
    channelId: '1',
    message: 'Hallo',
    timestamp: new Date(),
    sender: 'Dimi'
  },
  {
    channelId: '1',
    message: 'Hallo Dimi',
    timestamp: new Date(),
    sender: 'Dimi'
  }];
  sendChatMessages: ChatMessage[] = [{
    channelId: '1',
    message: 'Hallo2',
    timestamp: new Date(),
    sender: 'Dome'
  },
  {
    channelId: '1',
    message: 'Hallo Dome',
    timestamp: new Date(),
    sender: 'Dome'
  }

  ];

  @Output() receiveChatMessage!: string;
  @Output() sendChatMessage!: string;


}
