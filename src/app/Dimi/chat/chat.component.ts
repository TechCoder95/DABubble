import {
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatInformationComponent } from './chat-information/chat-information.component';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { InputfieldComponent } from './chat-inputfield/inputfield.component';
import { MessageType } from '../../shared/enums/messagetype';
import { GlobalsubService } from '../../shared/services/globalsub.service';
import { Subscription } from 'rxjs';
import { DABubbleUser } from '../../shared/interfaces/user';
import { ThreadComponent } from '../../rabia/thread/thread.component';
import { UserService } from '../../shared/services/user.service';
import { ThreadService } from '../../shared/services/thread.service';
import { ThreadChannel } from '../../shared/interfaces/thread-channel';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChannelService } from '../../shared/services/channel.service';
import { ThreadConversationComponent } from '../../rabia/thread/thread-conversation/thread-conversation.component';
import { Router } from '@angular/router';
import { MobileService } from '../../shared/services/mobile.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MatCardModule,
    ChatConversationComponent,
    ChatInformationComponent,
    InputfieldComponent,
    ThreadComponent,
    MatProgressSpinnerModule,
    ThreadConversationComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  @Output() selectedChannelFromChat = new EventEmitter<TextChannel>();
  @Output() selectedUserFromChat = new EventEmitter<DABubbleUser>();
  @Output() selectedThreadOwner = new EventEmitter<ThreadChannel>();
  @Output() activeUser!: any;

  channelsub!: Subscription;
  threadsub!: Subscription;

  public readonly channelService = inject(ChannelService);

  messageTypeDirects: MessageType = MessageType.Directs;
  messageType: MessageType = MessageType.Groups;
  showChatComponent!: boolean;
  messageTypeThreads = MessageType.Threads;

  private userService = inject(UserService);

  constructor(
    private subService: GlobalsubService,
    public threadService: ThreadService,
    private router: Router,
    public mobileService: MobileService,
  ) {}

  /**
   * Initializes the component and emits selected user and channel information.
   *
   * @returns {Promise<void>} A promise that resolves when the component is initialized.
   */
  async ngOnInit() {
    this.selectedUserFromChat.emit(
      JSON.parse(sessionStorage.getItem('userLogin')!),
    );

    this.selectedChannelFromChat.emit(
      JSON.parse(sessionStorage.getItem('selectedChannel')!),
    );

    this.channelsub = this.subService
      .getActiveChannelObservable()
      .subscribe((channel: TextChannel) => {
        this.selectedChannelFromChat.emit(channel);
      });

    if (sessionStorage.getItem('selectedThread')) {
      let selectedPerson = JSON.parse(
        sessionStorage.getItem('selectedThread')!,
      );

      this.userService
        .getOneUserbyId(selectedPerson.userID)
        .then((user: DABubbleUser) => {
          this.selectedUserFromChat.emit(user);
          this.activeUser = user;
        });

      this.selectedThreadOwner.emit(
        JSON.parse(sessionStorage.getItem('selectedThread')!),
      );
    }
  }

  /**
   * Lifecycle hook that is called when the component is about to be destroyed.
   * Unsubscribes from the channelsub and threadsub if they exist.
   */
  ngOnDestroy() {
    if (this.channelsub) {
      this.channelsub.unsubscribe();
    } else if (this.threadsub) {
      this.threadsub.unsubscribe();
    }
  }

  /**
   * Checks if the 'selectedThread' item exists in the sessionStorage.
   *
   * @returns {boolean} Returns true if the 'selectedThread' item exists in the sessionStorage, otherwise returns false.
   */
  getStorage() {
    if (sessionStorage.getItem('selectedThread')) {
      return true;
    }
    return false;
  }

  /**
   * Retrieves the current URL from the router.
   *
   * @returns The current URL.
   */
  getUrl() {
    return this.router.url;
  }
}
