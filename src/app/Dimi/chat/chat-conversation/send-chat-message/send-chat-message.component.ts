import { Component, Input } from '@angular/core';
import { ChatService } from '../../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../../shared/interfaces/chatmessage';
import { UserService } from '../../../../shared/services/user.service';

@Component({
  selector: 'app-send-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './send-chat-message.component.html',
  styleUrl: './send-chat-message.component.scss',
})
export class SendChatMessageComponent {
  constructor(
    private chatService: ChatService,
    private userService: UserService
  ) {}

  @Input() sendMessage!: ChatMessage;

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

  userAvatar(): string | undefined {
    const user = this.userService.users.find(
      (user) => user.username === this.sendMessage.sender
    );
    return user ? user.avatar : undefined;
  }
}
