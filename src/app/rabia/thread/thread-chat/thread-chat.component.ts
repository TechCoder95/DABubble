import { Component, Input, OnInit } from '@angular/core';
import { ThreadEmojiComponent } from "../thread-emoji/thread-emoji.component";
import { ThreadMyEmojiComponent } from "../thread-my-emoji/thread-my-emoji.component";
import { TicketService } from '../../../shared/services/ticket.service';
import { UserService } from '../../../shared/services/user.service';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';


@Component({
  selector: 'app-thread-chat',
  standalone: true,
  imports: [ThreadEmojiComponent, ThreadMyEmojiComponent],
  templateUrl: './thread-chat.component.html',
  styleUrl: './thread-chat.component.scss'
})
export class ThreadChatComponent {
  @Input() receiveMessage!: ChatMessage;
  ticket: any;

  constructor(public ticketService: TicketService) {
    this.ticket = this.ticketService.getTicket();

    console.log("jiuiu", this.ticket);

  }
}
