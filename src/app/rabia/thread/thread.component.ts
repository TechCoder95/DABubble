import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ThreadChatComponent } from "./thread-chat/thread-chat.component";
import { InputfieldComponent } from "../../Dimi/chat/chat-inputfield/inputfield.component";
import { SidenavComponent } from '../../tristan/sidenav/sidenav.component';
import { ChannelService } from '../../shared/services/channel.service';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ThreadInputComponent } from "./thread-input/thread-input.component";
import { ChatMessage } from '../../shared/interfaces/chatmessage';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MatCardModule, ThreadChatComponent, InputfieldComponent, CommonModule, ThreadInputComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  @Input() receiveMessage!: ChatMessage;
  
  showSingleThread!: boolean;


  constructor(public channelService: ChannelService, private userService: UserService) {
    console.log("hi", channelService.channel.conversationId);
    
   }

  get getTitle(): Observable<string> {
    return this.channelService.selectedChannel$.pipe(
      map((channel: any) => channel?.name || 'Channel')
    );
  }
  
  close() {
    this.channelService.showSingleThread = false;
  }
  
}
