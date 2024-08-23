import { AfterViewChecked, AfterViewInit, Component, EventEmitter, inject, Input, input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatInformationComponent } from './chat-information/chat-information.component';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { InputfieldComponent } from './chat-inputfield/inputfield.component';
import { MessageType } from '../../shared/enums/messagetype';
import { GlobalsubService } from '../../shared/services/globalsub.service';
import { DatabaseService } from '../../shared/services/database.service';
import { Subscription } from 'rxjs';
import { DABubbleUser } from '../../shared/interfaces/user';
import { ThreadComponent } from "../../rabia/thread/thread.component";
import { NavigationStart, Router } from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ChannelService } from '../../shared/services/channel.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MatCardModule,
    ChatConversationComponent,
    ChatInformationComponent,
    InputfieldComponent,
    ThreadComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {


  @Output() selectedChannelFromChat = new EventEmitter<TextChannel>();
  @Output() selectedUserFromChat = new EventEmitter<DABubbleUser>();

  channelsub!: Subscription;


  public readonly channelService = inject(ChannelService);

  messageTypeDirects: MessageType = MessageType.Directs;
  messageType: MessageType = MessageType.Groups;
  showChatComponent!: boolean;

  constructor(private databaseService: DatabaseService, private subService: GlobalsubService,  private router: Router) {

  }

  async ngOnInit() {
    this.selectedUserFromChat.emit(JSON.parse(sessionStorage.getItem('userLogin')!));

    this.selectedChannelFromChat.emit(JSON.parse(sessionStorage.getItem('selectedChannel')!));

    this.channelsub = this.subService.getActiveChannelObservable().subscribe((channel: TextChannel) => {
      this.selectedChannelFromChat.emit(channel);
    });
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
