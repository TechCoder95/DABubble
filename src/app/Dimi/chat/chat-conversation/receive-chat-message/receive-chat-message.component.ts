import { Component, Input, OnInit, Output } from '@angular/core';
import { ChatMessage } from '../../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../shared/services/user.service';
import { ReceiveChatMessageReactionComponent } from './receive-chat-message-reaction/receive-chat-message-reaction.component';

@Component({
  selector: 'app-receive-chat-message',
  standalone: true,
  imports: [CommonModule, ReceiveChatMessageReactionComponent],
  templateUrl: './receive-chat-message.component.html',
  styleUrl: './receive-chat-message.component.scss',
})
export class ReceiveChatMessageComponent implements OnInit {
  @Input() receiveMessage!: ChatMessage;
  // justId = this.receiveMessage.id;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getSenderName();
    this.getSenderAvatar();
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

  getSenderName() {
    let user = this.userService.getOneUserbyId(this.receiveMessage.senderId);
    return user?.username;
  }

  getSenderAvatar() {
    let user = this.userService.getOneUserbyId(this.receiveMessage.senderId);
    return user?.avatar;
  }
}
