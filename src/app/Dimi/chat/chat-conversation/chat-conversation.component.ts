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
  implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit
{
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
    private userService: UserService,
    private channelService: ChannelService,
    private databaseService: DatabaseService,
    private subService: GlobalsubService,
    public threadService: ThreadService,
  ) {
    this.activeUser = this.userService.activeUser;
    this.selectedChannel = JSON.parse(
      sessionStorage.getItem('selectedChannel')!,
    );
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

    this.databaseService.subscribeToMessageDatainChannel(
      this.selectedChannel.id,
    );

    this.allMessages = [];

    this.subService
      .getAllMessageObservable()
      .pipe(filter((message) => message.channelId === this.selectedChannel.id))
      .subscribe((message) => {
        if (message.id) {
          if (this.allMessages.some((msg) => msg.id === message.id)) {
            const messageArray: ChatMessage[] = this.allMessages.filter(
              (msg: ChatMessage) => msg.id === message.id,
            );
            const x = this.allMessages.indexOf(messageArray[0]);
            this.allMessages.splice(x, 1);
          }

          this.scrollToBottom();
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

  }

  ngAfterViewInit() {
    this.onScroll();
    setTimeout(() => {
      this.scrollToBottom();
    }, 1000);
  }

  /**
   * Handles the scroll event.
   *
   * This method is called when the user scrolls within the chat conversation component.
   * It checks the position of each message day element and hides or shows them based on their position.
   * If the bottom of the current day element is within 5 pixels of the top of the next day element,
   * the current day element is hidden. Otherwise, it is shown.
   */
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

  /**
   * Checks if two timestamps represent the same day.
   *
   * @param timestamp1 - The first timestamp.
   * @param timestamp2 - The second timestamp.
   * @returns A boolean indicating whether the timestamps represent the same day.
   */
  isSameDay(timestamp1: number, timestamp2: number): boolean {
    let date1 = new Date(timestamp1);
    let date2 = new Date(timestamp2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Checks if a message is repeated within 5 minutes of the previous message.
   * @param currentMessage - The current message to check.
   * @param previousMessage - The previous message to compare with.
   * @returns A boolean indicating if the current message is repeated within 5 minutes of the previous message.
   */
  repeatedMessageInUnder5Minutes(
    currentMessage: ChatMessage,
    previousMessage: ChatMessage,
  ): boolean {
    let currentTime = new Date(currentMessage.timestamp).getTime();
    let previousTime = new Date(previousMessage.timestamp).getTime();

    let timeDifferenceInMinutes = (currentTime - previousTime) / (1000 * 60);

    return timeDifferenceInMinutes < 10;
  }

  /**
   * Converts a timestamp to a formatted date string.
   *
   * @param timestamp - The timestamp to convert.
   * @returns The formatted date string.
   */
  checkDate(timestamp: number): string {
    let messageDate = new Date(timestamp);
    return messageDate.toLocaleDateString();
  }

  /**
   * Formats a timestamp into a string representation with the day included.
   * @param timestamp - The timestamp to format.
   * @returns The formatted string representation of the timestamp with the day included.
   */
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

  /**
   * Scrolls the chat conversation component to the bottom.
   */
  scrollToBottom() {
    this.scrollContainer.nativeElement.scrollTop =
      this.scrollContainer.nativeElement.scrollHeight;
  }
}
