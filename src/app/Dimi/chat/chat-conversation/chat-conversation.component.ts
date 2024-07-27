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
export class ChatConversationComponent implements OnInit, OnDestroy {
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
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService,
    private databaseService: DatabaseService
  ) {
    this.activeUser = this.userService.activeUser;
  }

  ngOnInit() {
    this.subscribeToDataChanges();
    this.subscribeToChannelChanges();
    this.subscribeToSendMessages();
    this.subscribeToReceiveMessages();
    /*  this.scrollToBottom(); */
  }

  /*  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToBottom(), 500);
  } */

  /*  scrollToBottom() {
    this.scrollContainer.nativeElement.scrollTop =
      this.scrollContainer.nativeElement.scrollHeight;
  } */

  subscribeToDataChanges() {
    this.databaseSubscription = this.databaseService.onDataChange$.subscribe(
      (channel) => {
        /* debugger; */
        this.allMessages = [];
        this.chatService.sortMessages(channel);
      }
    );
  }

  subscribeToChannelChanges() {
    this.channelSubscription = this.channelService.selectedChannel$.subscribe(
      () => {
        console.log('CHANNELOBSERVe');
      }
    );
  }

  subscribeToSendMessages() {
    this.sendMessagesSubscription = this.chatService.sendMessages$.subscribe(
      (message) => {
        /* debugger; */
        if (message) {
          //Hier irgendwas rein, dass checkt, ob die message bereits im Array existiert?
          this.allMessages.push(message);
          console.log('Wird das 2X ausgeführt?');
        }
      }
    );
  }

  subscribeToReceiveMessages() {
    this.chatService.receiveMessages$.subscribe((message) => {
      console.log('receiveMessagesSUBSCRIPTION');
      if (message !== null) {
        this.allMessages.push(message);
        console.log('WIRD DAS AUCH 2X augeführt?');
      }
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
