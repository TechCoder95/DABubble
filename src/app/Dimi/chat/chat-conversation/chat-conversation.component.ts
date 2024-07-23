import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { InputfieldComponent } from './chat-inputfield/inputfield.component';
import { ReceiveChatMessageComponent } from './receive-chat-message/receive-chat-message.component';
import { SendChatMessageComponent } from './send-chat-message/send-chat-message.component';
import { ChatService } from '../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { UserService } from '../../../shared/services/user.service';
import { ChannelService } from '../../../shared/services/channel.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [
    InputfieldComponent,
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
  private channelSubscription!: Subscription;
  private messageSubscription!: Subscription;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService,
    private cdr: ChangeDetectorRef
  ) {
    this.activeUser = this.userService.activeUser;
  }

  /* ngOnInit() {
    this.channelSubscription = this.channelService.selectedChannel$.subscribe({
      next: () => {
        this.sortMessages();
      },
      error: (err) => console.error(err),
    });
    this.sortMessages();
  } */
  ngOnInit() {
   /*  debugger; */
    this.channelSubscription = this.channelService.selectedChannel$.subscribe({
      next: () => {
        this.sortMessages();
      },
      error: (err) => console.error(err),
    });

    // Abonnieren des message$ Observable aus ChatService
    this.messageSubscription = this.chatService.message$.subscribe(
      (message) => {
        if (message) {
          if (message.sender === this.activeUser.username) {
            this.sendChatMessages.push(message);
          } else {
            this.receiveChatMessages.push(message);
          }
          this.cdr.detectChanges(); // Aktualisieren der Ansicht
        }
      }
    );

    this.sortMessages();
  }

  sortMessages() {
    this.sendChatMessages = [];
    this.receiveChatMessages = [];
    if (this.channelService.channel && this.channelService.channel.messages) {
      this.channelService.channel.messages.forEach((message) => {
        if (message.sender === this.activeUser.username) {
          this.sendChatMessages.push(message);
        } else {
          this.receiveChatMessages.push(message);
        }
      });
    } else {
      console.log('KEINE NACHRICHTEN');
    }
    this.cdr.detectChanges();
  }

  /*  ngOnDestroy() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  } */
  ngOnDestroy() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      // Bereinigung
      this.messageSubscription.unsubscribe();
    }
  }
}
