import { Component, Input, Output } from '@angular/core';
import { ChatMessage } from '../../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receive-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receive-chat-message.component.html',
  styleUrl: './receive-chat-message.component.scss',
})
export class ReceiveChatMessageComponent {
  @Input() receiveMessage!: ChatMessage;

  constructor() {
    console.log(this.receiveMessage);
  }
}
