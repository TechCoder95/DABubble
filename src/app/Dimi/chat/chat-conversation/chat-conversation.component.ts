import { Component, Input, OnInit, Output } from '@angular/core';
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
export class ChatConversationComponent implements OnInit {
  /*  @Output() receiveChatMessage!: string;
  @Output() sendChatMessage!: string;
  activeUser!: DABubbleUser;
  sendChatMessages: ChatMessage[] = [];
  receiveChatMessages: ChatMessage[] = [];

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService
  ) {
    this.activeUser = this.userService.activeUser;
    this.sortMessages();
  }

  sortMessages() {
    if (this.channelService.channel && this.channelService.channel.messages) {
      this.channelService.channel.messages.forEach((message) => {
        if (message.sender === this.activeUser.username) {
          this.sendChatMessages.push(message);
        } else {
          this.receiveChatMessages.push(message);
        }
      });
    } else{
      console.log('KEINE NACHRICHTEN')
    }
  } */
  @Output() receiveChatMessage!: string;
  @Output() sendChatMessage!: string;
  activeUser!: DABubbleUser;
  sendChatMessages: ChatMessage[] = [];
  receiveChatMessages: ChatMessage[] = [];
  private channelSubscription!: Subscription;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService
  ) {
    this.activeUser = this.userService.activeUser;
  }

  ngOnInit() {
    this.channelSubscription = this.channelService.selectedChannel$.subscribe({
      next: () => {
        this.sortMessages();
      },
      error: (err) => console.error(err),
    });
    this.sortMessages(); // Initialer Aufruf, um Nachrichten beim ersten Laden zu sortieren
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
  }

  ngOnDestroy() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  }
}
