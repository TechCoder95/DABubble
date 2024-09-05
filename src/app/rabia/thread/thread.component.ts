import { Component, Input, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { InputfieldComponent } from '../../Dimi/chat/chat-inputfield/inputfield.component';
import { ChannelService } from '../../shared/services/channel.service';
import { CommonModule } from '@angular/common';
import { MessageType } from '../../shared/enums/messagetype';
import { FormControl } from '@angular/forms';
import { DABubbleUser } from '../../shared/interfaces/user';
import { ThreadMessage } from '../../shared/interfaces/threadmessage';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { ThreadService } from '../../shared/services/thread.service';
import { DatabaseService } from '../../shared/services/database.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MatCardModule, InputfieldComponent, CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  @Input() activeUserFromSidenav: any;
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

  constructor(
    public channelService: ChannelService,
    public threadService: ThreadService,
    private databaseService: DatabaseService,
  ) {}

  ngOnInit() {
    this.selectedChannelFromChat = JSON.parse(
      sessionStorage.getItem('selectedChannel') || '{}',
    );
  }
}
