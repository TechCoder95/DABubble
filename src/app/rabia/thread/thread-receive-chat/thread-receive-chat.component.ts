import { Component, Input, OnInit } from '@angular/core';
import { ThreadEmojiComponent } from "../thread-emoji/thread-emoji.component";
import { ThreadMyEmojiComponent } from "../thread-my-emoji/thread-my-emoji.component";
import { TicketService } from '../../../shared/services/ticket.service';
import { UserService } from '../../../shared/services/user.service';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { ThreadMessage } from '../../../shared/interfaces/threadmessage';


@Component({
  selector: 'app-thread-receive-chat',
  standalone: true,
  imports: [ThreadEmojiComponent, ThreadMyEmojiComponent, CommonModule],
  templateUrl: './thread-receive-chat.component.html',
  styleUrl: './thread-receive-chat.component.scss'
})
export class ThreadReceiveChatComponent {
  @Input() receiveMessage!: ThreadMessage;
  ticket: any;

  constructor(public ticketService: TicketService, private userService: UserService) {
    this.ticket = this.ticketService.getTicket();
    this.getSenderAvatar();
  }

  getSenderAvatar(): Promise<string | undefined> {
    this.userService.getOneUserbyId(this.ticket.senderId).then((user) => {
    return Promise.resolve(user?.avatar);
    });
    return Promise.resolve(undefined);
  }
}
