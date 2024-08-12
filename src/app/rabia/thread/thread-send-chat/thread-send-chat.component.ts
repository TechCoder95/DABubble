import { Component, Input, OnInit } from '@angular/core';
import { ThreadMyEmojiComponent } from "../thread-my-emoji/thread-my-emoji.component";
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../shared/services/ticket.service';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ThreadMessage } from '../../../shared/interfaces/threadmessage';
import { MessageType } from '../../../shared/components/enums/messagetype';
import { InputfieldComponent } from '../../../Dimi/chat/chat-inputfield/inputfield.component';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-thread-send-chat',
  standalone: true,
  imports: [ThreadMyEmojiComponent, CommonModule, MatInputModule, InputfieldComponent],
  templateUrl: './thread-send-chat.component.html',
  styleUrl: './thread-send-chat.component.scss'
})
export class ThreadSendChatComponent implements OnInit {

  @Input() sendMessage!: ThreadMessage;
  originalMessage!: string;
  user: any;
  messageType = MessageType.Threads;

  constructor(public ticketService: TicketService, public userService: UserService) {

    this.user = this.userService.activeUser
  }

  ngOnInit(): void {
    // this.originalMessage = this.sendMessage.message;



    console.log("name", this.user, this.messageType, "lo");

  }


  // getUserAvatar(): string | undefined {
  //   let user = this.userService.getOneUserbyId(this.user.id!);
  //   return user?.avatar;
  // }
}
