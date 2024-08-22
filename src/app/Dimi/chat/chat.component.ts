import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatInformationComponent } from './chat-information/chat-information.component';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { InputfieldComponent } from './chat-inputfield/inputfield.component';
import { MessageType } from '../../shared/enums/messagetype';
import { GlobalsubService } from '../../shared/services/globalsub.service';
import { Subscription } from 'rxjs';
import { DABubbleUser } from '../../shared/interfaces/user';
import { ThreadComponent } from "../../rabia/thread/thread.component";
import { UserService } from '../../shared/services/user.service';
import { ThreadService } from '../../shared/services/thread.service';
import { ThreadChannel } from '../../shared/interfaces/thread-channel';
import { NavigationStart, Router } from '@angular/router';
import { DatabaseService } from '../../shared/services/database.service';
import { ChatMessage } from '../../shared/interfaces/chatmessage';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MatCardModule,
    ChatConversationComponent,
    ChatInformationComponent,
    InputfieldComponent,
    ThreadComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {


  @Output() selectedChannelFromChat = new EventEmitter<TextChannel>();
  @Output() selectedUserFromChat = new EventEmitter<DABubbleUser>();
  @Output() selectedThreadOwner = new EventEmitter<ThreadChannel>();
  @Output() ebbes = new EventEmitter<ChatMessage>();

  @Output() activeUser!: any;

  channelsub!: Subscription;
  threadsub!: Subscription;


  messageTypeDirects: MessageType = MessageType.Directs;
  messageType: MessageType = MessageType.Groups;
  showChatComponent!: boolean;
  messageTypeThreads = MessageType.Threads;


  private userService = inject(UserService);

  
  constructor(private databaseService: DatabaseService, private subService: GlobalsubService,  private router: Router, public threadService: ThreadService) {

  }

  async ngOnInit() {
    this.selectedUserFromChat.emit(JSON.parse(sessionStorage.getItem('userLogin')!));

    this.selectedChannelFromChat.emit(JSON.parse(sessionStorage.getItem('selectedChannel')!));

    this.channelsub = this.subService.getActiveChannelObservable().subscribe((channel: TextChannel) => {
      this.selectedChannelFromChat.emit(channel);
    });

    let selectedPerson = this.getsessionStorage('selectedThread');

    this.userService.getOneUserbyId(selectedPerson.userID).then((user: DABubbleUser) => {
      this.selectedUserFromChat.emit(user);
      this.activeUser = user;
    }
    );

    this.selectedThreadOwner.emit(this.getsessionStorage('selectedThread')!);
  }


  ngOnDestroy() {
    console.log('ChatComponent destroyed');
    if (this.channelsub) {
      this.channelsub.unsubscribe();
    } else if (this.threadsub) {
      this.threadsub.unsubscribe();
    }
  }



  getsessionStorage(key: string) {
    return JSON.parse(sessionStorage.getItem(key)!);
  }
}
