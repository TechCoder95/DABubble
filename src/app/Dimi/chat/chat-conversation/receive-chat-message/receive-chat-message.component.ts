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

  checkDate(date: number): string {
    const today = new Date();
    const givenDate = new Date(date);

    if (givenDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      return 'Heute';
    } else {
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(givenDate);
    }
  }
}
