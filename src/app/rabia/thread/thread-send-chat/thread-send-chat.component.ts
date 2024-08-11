import { Component, Input, OnInit } from '@angular/core';
import { ThreadMyEmojiComponent } from "../thread-my-emoji/thread-my-emoji.component";
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../shared/services/ticket.service';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ThreadMessage } from '../../../shared/interfaces/threadmessage';

@Component({
  selector: 'app-thread-send-chat',
  standalone: true,
  imports: [ThreadMyEmojiComponent, CommonModule],
  templateUrl: './thread-send-chat.component.html',
  styleUrl: './thread-send-chat.component.scss'
})
export class ThreadSendChatComponent implements OnInit {
  // user!: DABubbleUser;
  @Input() sendMessage!: ThreadMessage;
  originalMessage!: string;
  user: any;

  constructor(public ticketService: TicketService, public userService: UserService) {

    this.user = this.userService.activeUser
  }

  ngOnInit(): void {
    // this.originalMessage = this.sendMessage.message;



    console.log("name", this.user, this.sendMessage, "lo");

  }


  // getUserAvatar(): string | undefined {
  //   let user = this.userService.getOneUserbyId(this.user.id!);
  //   return user?.avatar;
  // }
}
