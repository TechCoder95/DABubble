import { Component, Input, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ThreadReceiveChatComponent } from './thread-receive-chat/thread-receive-chat.component';
import { InputfieldComponent } from '../../Dimi/chat/chat-inputfield/inputfield.component';
import { ChannelService } from '../../shared/services/channel.service';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { ThreadSendChatComponent } from './thread-send-chat/thread-send-chat.component';
import { MessageType } from '../../shared/components/enums/messagetype';
import { FormControl } from '@angular/forms';
import { DABubbleUser } from '../../shared/interfaces/user';
import { TicketService } from '../../shared/services/ticket.service';
import { ThreadMessage } from '../../shared/interfaces/threadmessage';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { ThreadService } from '../../shared/services/thread.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    MatCardModule,
    ThreadReceiveChatComponent,
    InputfieldComponent,
    CommonModule,
    ThreadSendChatComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  @Input() activeUserFromSidenav: any;
  ticket = this.ticketService.getTicket();
  threadMessages: ThreadMessage[] = [];

  searchControl = new FormControl();
  searchResults: DABubbleUser[] = [];
  showSingleThread!: boolean;
  messageType: MessageType = MessageType.Threads;


  activeUser!: DABubbleUser;

  threadChannel: TextChannel = {
    id: '',
    name: '',
    description: '',
    owner: '',
    assignedUser: [],
    isPrivate: false,
  };

  @Input() selectedChannelFromChat: any;
  // @Output() message

  constructor(
    public ticketService: TicketService,
    public channelService: ChannelService,
    private userService: UserService,
    public threadService: ThreadService
  ) {}

  ngOnInit() {
    console.log('ThreadComponent initialized');
    
  }



  get getTitle(): Observable<string> {
    return this.channelService.selectedChannel$.pipe(
      map((channel: any) => channel?.name || 'Channel')
    );
  }

  close() {
    this.threadService.selectedThread = false;
  }
}
