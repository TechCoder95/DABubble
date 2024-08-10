import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
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
  implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {


  @Output() receiveChatMessage = new EventEmitter<ChatMessage>();
  @Output() sendChatMessage = new EventEmitter<ChatMessage>();



  activeUser!: DABubbleUser;
  allMessages: ChatMessage[] = [];

  @Input() activeChannelFromChat: any;
  @Input() messagesFromChat: any;
  @Input() activeUserFromChat: any;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChildren('messageDay') messageDays!: QueryList<ElementRef>;
  isPrivate: boolean = this.channelService.channel.isPrivate;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService,
    private databaseService: DatabaseService
  ) {
    this.activeUser = this.userService.activeUser;
  }

  ngOnInit() {
    this.activeUserFromChat.subscribe((user: any) => {
      this.activeUser = user;
    });


    this.activeChannelFromChat.subscribe((channel: any) => {
      this.allMessages = [];
      this.databaseService.subscribeToMessageDatainChannel(channel.id);
    });

    this.messagesFromChat.subscribe((message: any) => {
      if (message.id) {
        this.allMessages.push(message)
        this.allMessages.sort((a, b) => a.timestamp - b.timestamp);
      }
    });
  }

  ngOnDestroy() {
  }

  ngAfterViewChecked(): void {
    setTimeout(() => {
      this.scrollToBottom();
    }, 1000);
  }

  ngAfterViewInit() {
    this.onScroll();
  }

  onScroll() {
    const messageDaysArray = this.messageDays.toArray();
    for (let i = 0; i < messageDaysArray.length - 1; i++) {
      let currentDay = messageDaysArray[i].nativeElement;
      let nextDay = messageDaysArray[i + 1].nativeElement;

      let currentDayRect = currentDay.getBoundingClientRect();
      let nextDayRect = nextDay.getBoundingClientRect();

      if (currentDayRect.bottom >= nextDayRect.top - 5) {
        if (currentDay.style.visibility !== 'hidden') {
          currentDay.style.visibility = 'hidden';
        }
      } else {
        if (currentDay.style.visibility !== 'visible') {
          currentDay.style.visibility = 'visible';
        }
      }
    }
  }

  isSameDay(timestamp1: number, timestamp2: number): boolean {
    let date1 = new Date(timestamp1);
    let date2 = new Date(timestamp2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  repeatedMessageInUnder5Minutes(
    currentMessage: ChatMessage,
    previousMessage: ChatMessage
  ): boolean {
    let currentTime = new Date(currentMessage.timestamp).getTime();
    let previousTime = new Date(previousMessage.timestamp).getTime();

    let timeDifferenceInMinutes = (currentTime - previousTime) / (1000 * 60);

    return timeDifferenceInMinutes < 10;
  }

  checkDate(timestamp: number): string {
    let messageDate = new Date(timestamp);
    return messageDate.toLocaleDateString();
  }

  groupMessagesByDate() {
    let groupedMessages: any = {};
    this.allMessages.forEach((message) => {
      let date = this.checkDate(message.timestamp);
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });
    return groupedMessages;
  }

  formatDateWithDay(timestamp: any): string {
    const messageDate = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Berlin',
    };
    return messageDate.toLocaleDateString('de-DE', options);
  }

  scrollToBottom() {
    this.scrollContainer.nativeElement.scrollTop =
      this.scrollContainer.nativeElement.scrollHeight;
  }

}