import { Component } from '@angular/core';
import { ChatService } from '../../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-send-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './send-chat-message.component.html',
  styleUrl: './send-chat-message.component.scss',
})
export class SendChatMessageComponent {
  message: string = '';
  time = new Date();

  constructor(private chatService: ChatService) {
    setInterval(() => {
      this.time = new Date();
    }, 60000);
  }

  subscribeToMessages() {
    this.chatService.currentMessage$.subscribe((msg) => {
      this.message = msg;
    });
  }
}
