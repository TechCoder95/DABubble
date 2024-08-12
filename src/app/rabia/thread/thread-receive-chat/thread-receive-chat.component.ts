import { Component, Input, OnInit } from '@angular/core';
import { ThreadEmojiComponent } from "../thread-emoji/thread-emoji.component";
import { ThreadMyEmojiComponent } from "../thread-my-emoji/thread-my-emoji.component";
import { TicketService } from '../../../shared/services/ticket.service';
import { UserService } from '../../../shared/services/user.service';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { ThreadMessage } from '../../../shared/interfaces/threadmessage';
import { DABubbleUser } from '../../../shared/interfaces/user';


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

  senderUser: DABubbleUser = {username: "dummy", avatar: "./img/avatar.svg", mail:"", isLoggedIn: false};

  constructor(public ticketService: TicketService, private userService: UserService) {
    this.ticket = this.ticketService.getTicket();
    
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getUser();
  }
  async getUser() {
    this.senderUser.avatar = "./img/avatar.svg";
    let user = await this.userService.getOneUserbyId(this.ticket.senderId);
    this.senderUser = user;
  }
}
