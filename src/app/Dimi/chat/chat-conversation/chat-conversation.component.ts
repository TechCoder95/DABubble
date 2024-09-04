import {
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
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { UserService } from '../../../shared/services/user.service';
import { ChannelService } from '../../../shared/services/channel.service';
import { filter, Subscription, tap } from 'rxjs';
import { DatabaseService } from '../../../shared/services/database.service';
import { GlobalsubService } from '../../../shared/services/globalsub.service';
import { PreChatMessageComponent } from './pre-chat-message/pre-chat-message.component';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { ThreadService } from '../../../shared/services/thread.service';
import { ChatType } from '../../../shared/enums/chattype';

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [
    ReceiveChatMessageComponent,
    SendChatMessageComponent,
    CommonModule,
    PreChatMessageComponent,
  ],
  templateUrl: './chat-conversation.component.html',
  styleUrl: './chat-conversation.component.scss',
})
export class ChatConversationComponent
  implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit {
  @Output() receiveChatMessage = new EventEmitter<ChatMessage>();
  @Output() sendChatMessage = new EventEmitter<ChatMessage>();
  @Output() selectedChannelFromChat = new EventEmitter<TextChannel>();

  activeUser!: DABubbleUser;
  allMessages: ChatMessage[] = [];
  selectedChannel!: TextChannel;
  selectedMessage!: DABubbleUser;
  chatTypeChannel: ChatType = ChatType.Channel;

  @Input() activeChannelFromChat: any;
  @Input() activeUserFromChat: any;
 

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChildren('messageDay') messageDays!: QueryList<ElementRef>;


  constructor(
    private userService: UserService, private channelService: ChannelService, private databaseService: DatabaseService, private subService: GlobalsubService, public threadService: ThreadService) {
    this.activeUser = this.userService.activeUser;
    this.selectedChannel = JSON.parse(sessionStorage.getItem('selectedChannel')!);
  }

  messagesub!: Subscription;

  ngOnInit() {

    this.activeUserFromChat.subscribe((user: any) => {
      this.activeUser = user;
    });


    this.activeChannelFromChat.subscribe((channel: TextChannel) => {
      this.allMessages = [];
      this.selectedChannelFromChat.emit(channel);

    });

    this.databaseService.subscribeToMessageDatainChannel(this.selectedChannel.id);

    this.allMessages = [];

    this.subService.getAllMessageObservable()
      .pipe(filter((message) => message.channelId === this.selectedChannel.id))
      .subscribe((message) => {
        if (message.id) {

          if (this.allMessages.some((msg) => msg.id === message.id)) {
            const messageArray: ChatMessage[] = this.allMessages.filter((msg:ChatMessage) => msg.id === message.id);
            const x = this.allMessages.indexOf(messageArray[0]);
            this.allMessages.splice(x, 1);
          }
          
          this.allMessages.push(message);
          this.allMessages.sort((a, b) => a.timestamp - b.timestamp);
        }
      });
  }

  ngOnDestroy() {
    if (this.channelService.channelSub)
      this.channelService.channelSub.unsubscribe();
  }

  ngAfterViewChecked(): void {
    // setTimeout(() => {
    //   this.scrollToBottom();
    // }, 1000);
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


  formatDateWithDay(timestamp: any): string {
    const messageDate = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
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
