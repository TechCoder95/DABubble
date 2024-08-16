import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { ChatMessage } from '../../shared/interfaces/chatmessage';

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

  constructor(
    public ticketService: TicketService,
    public channelService: ChannelService,
    private userService: UserService
  ) {

    console.log("das sollte der offene Thread sein", this.ticket, this.threadChannel);

  }

  ngOnInit() {
    console.log('ThreadComponent initialized');
    
  }

  // ngOnInit() {
  //   this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), switchMap(value => {
  //     if (this.selectedTicket) {
  //       this.selectedTicket = false;
  //       return [];
  //     }
  //     return this.userService.searchUsersByNameOrEmail(value);
  //   })
  //   ).subscribe(results => {
  //     this.searchResults = results;
  //   });
  // }

  // selectUser(user: DABubbleUser) {
  //   this.selectedTicket = true;
  //   this.searchQuery = user.username;
  //   this.searchControl.setValue(user.username);
  //   this.searchResults = [];
  //   this.userService.setSelectedUser(user);
  // }

  get getTitle(): Observable<string> {
    return this.channelService.selectedChannel$.pipe(
      map((channel: any) => channel?.name || 'Channel')
    );
  }

  close() {
    this.channelService.showSingleThread = false;
  }
}
