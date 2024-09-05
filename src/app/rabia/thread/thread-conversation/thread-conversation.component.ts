import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { ThreadService } from '../../../shared/services/thread.service';
import { DatabaseService } from '../../../shared/services/database.service';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { UserService } from '../../../shared/services/user.service';
import { GlobalsubService } from '../../../shared/services/globalsub.service';
import { ChannelService } from '../../../shared/services/channel.service';
import { ReceiveChatMessageComponent } from '../../../Dimi/chat/chat-conversation/receive-chat-message/receive-chat-message.component';
import { SendChatMessageComponent } from '../../../Dimi/chat/chat-conversation/send-chat-message/send-chat-message.component';
import { ThreadChannel } from '../../../shared/interfaces/thread-channel';
import { filter, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ChatService } from '../../../shared/services/chat.service';
import { ChatType } from '../../../shared/enums/chattype';

@Component({
  selector: 'app-thread-conversation',
  standalone: true,
  imports: [
    CommonModule,
    ReceiveChatMessageComponent,
    SendChatMessageComponent,
  ],
  templateUrl: './thread-conversation.component.html',
  styleUrl: './thread-conversation.component.scss',
})
export class ThreadConversationComponent {
  private readonly router = inject(Router);
  activeUser!: DABubbleUser;
  allThreadMessages: ChatMessage[] = [];
  selectedMessage!: ChatMessage;
  selectedThread!: ThreadChannel;
  threadSub!: Subscription;
  chatTypeThreads: ChatType = ChatType.Threads;

  @Output() receiveChatMessage = new EventEmitter<ChatMessage>();
  @Output() sendChatMessage = new EventEmitter<ChatMessage>();

  @Input() activeUserFromChat: any;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChildren('messageDay') messageDays!: QueryList<ElementRef>;

  constructor(
    public chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService,
    private databaseService: DatabaseService,
    private subService: GlobalsubService,
    public threadService: ThreadService,
  ) {}

  ngOnInit(): void {
    this.activeUser = this.userService.activeUser;
    this.selectedThread = JSON.parse(sessionStorage.getItem('selectedThread')!);
    this.threadSub = this.subService
      .getActiveThreadObservable()
      .subscribe((thread) => {
        this.selectedThread = thread;
        this.allThreadMessages = [];
        this.selectedMessage = JSON.parse(
          sessionStorage.getItem('threadMessage')!,
        );
        this.selectedMessage.replyNumber = 0;
        this.allThreadMessages.push(this.selectedMessage);

        this.databaseService
          .subscribeToMessageDatainChannel(this.selectedThread.id)
          .then(() => {
            this.subService
              .getAllMessageObservable()
              .pipe(
                filter(
                  (message) => message.channelId === this.selectedThread.id,
                ),
              )
              .subscribe((message) => {
                if (message.id) {
                  if (
                    this.allThreadMessages.some((msg) => msg.id === message.id)
                  ) {
                    return;
                  }
                  this.allThreadMessages.push(message);
                  this.allThreadMessages.sort(
                    (a, b) => a.timestamp - b.timestamp,
                  );
                }
              });
          });
      });

    this.subService.updateActiveThread(this.selectedThread);
  }

  ngOnDestroy() {
    if (this.channelService.channelSub) {
      this.channelService.channelSub.unsubscribe();
    }
    if (this.threadSub) {
      this.threadSub.unsubscribe();
    }
  }

  /**
   * Handles the scroll event and adjusts the visibility of message days.
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
   * @param currentMessage - The current chat message.
   * @param previousMessage - The previous chat message.
   * @returns A boolean indicating if the message is repeated within 5 minutes.
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
   *
   * @param timestamp - The timestamp to format.
   * @returns The formatted string representation of the timestamp with the day included.
   */
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

  /**
   * Scrolls the container to the bottom.
   */
  scrollToBottom() {
    this.scrollContainer.nativeElement.scrollTop =
      this.scrollContainer.nativeElement.scrollHeight;
  }
}
