import { Component } from '@angular/core';
import { InputfieldComponent } from './chat-inputfield/inputfield.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [InputfieldComponent, ChatMessageComponent],
  templateUrl: './chat-conversation.component.html',
  styleUrl: './chat-conversation.component.scss',
})
export class ChatConversationComponent {}
