import { AfterViewChecked, AfterViewInit, Component, EventEmitter, Input, input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatInformationComponent } from './chat-information/chat-information.component';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { InputfieldComponent } from './chat-inputfield/inputfield.component';
import { MessageType } from '../../shared/components/enums/messagetype';
import { GlobalsubService } from '../../shared/services/globalsub.service';
import { DatabaseService } from '../../shared/services/database.service';
import { Subscription } from 'rxjs';
import { DABubbleUser } from '../../shared/interfaces/user';
import { ThreadComponent } from "../../rabia/thread/thread.component";
import { UserService } from '../../shared/services/user.service';
import { ThreadService } from '../../shared/services/thread.service';

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

  @Output() activeUserFromThread!: any;

  channelsub!: Subscription;


  messageTypeDirects: MessageType = MessageType.Directs;
  messageType: MessageType = MessageType.Groups;

  constructor(
    private databaseService: DatabaseService,
    private subService: GlobalsubService,
    private userService: UserService,
    public threadService: ThreadService) {

    
  }

  async ngOnInit() {
    this.selectedUserFromChat.emit(JSON.parse(sessionStorage.getItem('userLogin')!));

    this.selectedChannelFromChat.emit(JSON.parse(sessionStorage.getItem('selectedChannel')!));

    this.channelsub = this.subService.getActiveChannelObservable().subscribe((channel: TextChannel) => {
      this.selectedChannelFromChat.emit(channel);
    });

    console.log(this.getsessionStorage('selectedThread'));

    let selectedPerson = this.getsessionStorage('selectedThread');
    console.log(selectedPerson.userID);

    this.userService.getOneUserbyId(selectedPerson.userID).then((user: DABubbleUser) => {
      this.selectedUserFromChat.emit(user);
      console.log(user, "butz", this.threadService.selectedThread);

      this.activeUserFromThread = user;
    }
    
    );

  }
  ngOnDestroy() {
    console.log('ChatComponent destroyed');
    if (this.channelsub)
      this.channelsub.unsubscribe();
  }

  getsessionStorage(key: string) {
    return JSON.parse(sessionStorage.getItem(key)!);
  }
}
