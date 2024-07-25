import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
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
export class ChatConversationComponent implements OnInit, OnDestroy {
  @Output() receiveChatMessage!: string;
  @Output() sendChatMessage!: string;
  activeUser!: DABubbleUser;
  sendChatMessages: ChatMessage[] = [];
  receiveChatMessages: ChatMessage[] = [];
  allMessages: ChatMessage[] = [];
  private channelSubscription!: Subscription;
  private messageSubscription!: Subscription;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService,
    private databaseService: DatabaseService
  ) {
    this.activeUser = this.userService.activeUser;
  }

  ngOnInit() {
    this.databaseService.onDataChange$.subscribe((channel) => {
      /* this.sendChatMessages = [];
      this.receiveChatMessages = []; */
      this.allMessages = [];
      this.chatService.sortMessages(channel);
    });
    this.channelSubscription = this.channelService.selectedChannel$.subscribe(
      () => {
        console.log('CHANNELOBSERVe');
      }
    );
    this.chatService.sendMessages$.subscribe((message) => {
      console.log('sendMessagesSUBSCRIPTION');
      if (message !== null) {
       /*  this.sendChatMessages.push(message); */
        this.allMessages.push(message);
        console.log(this.allMessages);
      }
    });
    this.chatService.receiveMessages$.subscribe((message) => {
      console.log('receiveMessagesSUBSCRIPTION');
      if (message !== null) {
       /*  this.receiveChatMessages.push(message); */
        this.allMessages.push(message);
        console.log(this.allMessages);
      }
    });
  }

  sendMessage() {}

  ngOnDestroy() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      // Bereinigung
      this.messageSubscription.unsubscribe();
    }
  }

  /*  orderMessages() {
    this.allMessages = [];

  } */
}
