import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { ThreadService } from '../../../shared/services/thread.service';
import { DatabaseService } from '../../../shared/services/database.service';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { UserService } from '../../../shared/services/user.service';
import { GlobalsubService } from '../../../shared/services/globalsub.service';
import { ChannelService } from '../../../shared/services/channel.service';
import { ReceiveChatMessageComponent } from "../../../Dimi/chat/chat-conversation/receive-chat-message/receive-chat-message.component";
import { SendChatMessageComponent } from "../../../Dimi/chat/chat-conversation/send-chat-message/send-chat-message.component";

@Component({
  selector: 'app-thread-conversation',
  standalone: true,
  imports: [CommonModule, ReceiveChatMessageComponent, SendChatMessageComponent],
  templateUrl: './thread-conversation.component.html',
  styleUrl: './thread-conversation.component.scss'
})
export class ThreadConversationComponent {
  activeUser!: DABubbleUser;
  allThreadMessages: ChatMessage[] = [];
  selectedMessage!: DABubbleUser;
  selectedThread!: TextChannel;

  @Output() receiveChatMessage = new EventEmitter<ChatMessage>();
  @Output() sendChatMessage = new EventEmitter<ChatMessage>();

  @Input() activeUserFromChat: any;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChildren('messageDay') messageDays!: QueryList<ElementRef>;

  constructor(private userService: UserService, private channelService: ChannelService, private databaseService: DatabaseService, private subService: GlobalsubService, public threadService: ThreadService) {

    this.activeUser = this.userService.activeUser;
    this.selectedThread = JSON.parse(sessionStorage.getItem('selectedThread')!);
  }

  ngOnInit(): void {
    this.threadService.selectedMessage.subscribe((selectedMessage: any) => {
      this.selectedMessage = selectedMessage[0];
      // console.log(selectedMessage[0], "jutta");

      this.allThreadMessages.push(selectedMessage[0]);
    });

    this.databaseService.subscribeToMessageDatainChannel(this.selectedThread.id);
    this.allThreadMessages = [];

    console.log(this.selectedThread.id, "Nummer 1", this.databaseService.threadID);

    this.databaseService.subscribeToMessageDatainChannel(this.selectedThread.id);
    this.allThreadMessages = [];


    console.log(this.selectedThread.id, "Nummer 2", this.databaseService.threadID);



    this.subService.getAllMessageObservable().subscribe((message) => {
      if (message.id) {
        if (this.allThreadMessages.some((msg) => msg.id === message.id)) {
          // console.log(message, "das hier zeigt die nachricht an, die man grad eingegeben hat");
          return;
        }
        this.allThreadMessages.push(message);
        this.allThreadMessages.sort((a, b) => a.timestamp - b.timestamp);
      }
    });
  }



  ngOnDestroy() {
    console.log('Chat Conversation Destroyed');
    if (this.channelService.channelSub)
      this.channelService.channelSub.unsubscribe();
  }

  onScroll() {
    console.log('scrolling', this.selectedMessage, "hier der gesamte Array von den allThreadMesgs", this.allThreadMessages);

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
