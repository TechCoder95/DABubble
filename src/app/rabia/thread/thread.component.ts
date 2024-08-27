import { Component, Input, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { InputfieldComponent } from '../../Dimi/chat/chat-inputfield/inputfield.component';
import { ChannelService } from '../../shared/services/channel.service';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { MessageType } from '../../shared/enums/messagetype';
import { FormControl } from '@angular/forms';
import { DABubbleUser } from '../../shared/interfaces/user';
import { TicketService } from '../../shared/services/ticket.service';
import { ThreadMessage } from '../../shared/interfaces/threadmessage';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { ThreadService } from '../../shared/services/thread.service';
import { DatabaseService } from '../../shared/services/database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MatCardModule, InputfieldComponent, CommonModule,],
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
    public threadService: ThreadService,
    private databaseService: DatabaseService,
    private router : Router
  ) { }

  ngOnInit() {
    console.log('ThreadComponent initialized');
    this.selectedChannelFromChat = JSON.parse(sessionStorage.getItem('selectedChannel') || '{}');

    this.threadService.findSenderByMessageID(this.databaseService.threadMessageID);
  }

}
