import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ReceiveChatMessageComponent } from './receive-chat-message/receive-chat-message.component';
import { SendChatMessageComponent } from './send-chat-message/send-chat-message.component';
import { ChatService } from '../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { UserService } from '../../../shared/services/user.service';
import { ChannelService } from '../../../shared/services/channel.service';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../../../shared/services/database.service';

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [
    ReceiveChatMessageComponent,
    SendChatMessageComponent,
    CommonModule,
  ],
  templateUrl: './chat-conversation.component.html',
  styleUrl: './chat-conversation.component.scss',
})
export class ChatConversationComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Output() receiveChatMessage!: string;
  @Output() sendChatMessage!: string;
  activeUser!: DABubbleUser;
  sendChatMessages: ChatMessage[] = [];
  receiveChatMessages: ChatMessage[] = [];
  allMessages: ChatMessage[] = [];
  private databaseSubscription!: Subscription;
  private channelSubscription!: Subscription;
  private sendMessagesSubscription!: Subscription;
  private receiveMessagesSubscription!: Subscription;
  private activeUserSubscription!: Subscription;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  isPrivate!: boolean | undefined;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService,
    private databaseService: DatabaseService
  ) {
    /*  this.activeUser = this.userService.activeUser; */
  }

  ngOnInit() {
    this.subscribeToDataChanges();
    this.subscribeToChannelChanges();
    this.subscribeToSendMessages();
    this.subscribeToReceiveMessages();
    this.subscribeToActiveUser();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToBottom(), 1000);
  }

  scrollToBottom() {
    this.scrollContainer.nativeElement.scrollTop =
      this.scrollContainer.nativeElement.scrollHeight;
  }

  subscribeToActiveUser() {
    this.activeUserSubscription =
      this.userService.activeUserObserver$.subscribe((user) => {
        if (user) {
          this.activeUser = user;
          console.log(this.activeUser);
        }
      });
  }

  subscribeToDataChanges() {
    if (this.databaseSubscription) {
      return;
    }

    this.databaseSubscription = this.databaseService.onDataChange$.subscribe(
      async (channel) => {
        this.allMessages = [];
        await this.chatService.sortMessages(channel);
        this.scrollToBottom();
      }
    );
  }

  subscribeToChannelChanges() {
    if (this.channelSubscription) {
      return;
    }

    this.channelSubscription = this.channelService.selectedChannel$.subscribe(
      (channel) => {
        console.log('CHANNELOBSERVe');
        this.isPrivate = channel?.isPrivate;
      }
    );
  }

  subscribeToSendMessages() {
    if (this.sendMessagesSubscription) {
      return;
    }

    this.sendMessagesSubscription = this.chatService.sendMessages$.subscribe(
      (message) => {
        if (message) {
          this.allMessages.push(message);
        }
        setTimeout(() => this.scrollToBottom(), 1000);
      }
    );
  }

  subscribeToReceiveMessages() {
    if (this.receiveMessagesSubscription) {
      return;
    }

    this.receiveMessagesSubscription =
      this.chatService.receiveMessages$.subscribe((message) => {
        if (message !== null) {
          this.allMessages.push(message);
        }
        setTimeout(() => this.scrollToBottom(), 1000);
      });
  }

  ngOnDestroy() {
    if (this.databaseSubscription) {
      this.databaseSubscription.unsubscribe();
    }
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
    if (this.sendMessagesSubscription) {
      this.sendMessagesSubscription.unsubscribe();
    }
    if (this.receiveMessagesSubscription) {
      this.receiveMessagesSubscription.unsubscribe();
    }
  }
}
