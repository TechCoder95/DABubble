import { Component, Input } from '@angular/core';
import { ThreadMyEmojiComponent } from "../thread-my-emoji/thread-my-emoji.component";
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../shared/services/ticket.service';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';

@Component({
  selector: 'app-thread-send-chat',
  standalone: true,
  imports: [ThreadMyEmojiComponent, CommonModule],
  templateUrl: './thread-send-chat.component.html',
  styleUrl: './thread-send-chat.component.scss'
})
export class ThreadSendChatComponent {
  @Input() user!: DABubbleUser;

  
  constructor(public ticketService: TicketService, private userService: UserService) {

    
   }




  // getUserName() {
  //   let user = this.userService.getOneUserbyId(this.user.id!);
  //   return user?.username;
  // }

  // getUserAvatar(): string | undefined {
  //   let user = this.userService.getOneUserbyId(this.user.id!);
  //   return user?.avatar;
  // }
}
