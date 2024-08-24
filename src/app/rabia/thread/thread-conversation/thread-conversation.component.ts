import { Component, EventEmitter, Input, Output } from '@angular/core';
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

@Component({
  selector: 'app-thread-conversation',
  standalone: true,
  imports: [CommonModule, ReceiveChatMessageComponent],
  templateUrl: './thread-conversation.component.html',
  styleUrl: './thread-conversation.component.scss'
})
export class ThreadConversationComponent {
  activeUser!: DABubbleUser;
  allThreadMessages: ChatMessage[] = [];
  selectedMessage!: DABubbleUser;
  selectedThread!: TextChannel;

  @Output() receiveChatMessage = new EventEmitter<ChatMessage>();
  @Input() activeUserFromChat: any;

  constructor(private userService: UserService, private channelService: ChannelService, private databaseService: DatabaseService, private subService: GlobalsubService, public threadService: ThreadService) {

    this.activeUser = this.userService.activeUser;
    this.selectedThread = JSON.parse(sessionStorage.getItem('selectedThread')!);
  }

  ngOnInit(): void {
    this.threadService.selectedMessage.subscribe((selectedMessage: any) => {
      this.selectedMessage = selectedMessage[0];
      console.log(selectedMessage[0], "jutta");

      this.allThreadMessages.push(selectedMessage[0]);
    });

    // this.allThreadMessages = [];
    // this.databaseService.subscribeToMessageDatainChannel(JSON.parse(sessionStorage.getItem('selectedThread')!).id);

    // this.databaseService.subscribeToMessageDatainChannel(this.selectedThread.id);
    // this.allThreadMessages = [];

    // this.databaseService.subscribeToMessageDatainChannel(this.selectedThread.id);
    // this.allThreadMessages = [];




    // this.subService.getAllMessageObservable().subscribe((message) => {
    //   if (message.id) {
    //     if (this.allThreadMessages.some((msg) => msg.id === message.id)) {
    //       console.log(message, "das hier zeigt die nachricht an, die man grad eingegeben hat");
    //       return;
    //     }
    //     this.allThreadMessages.push(message);
    //     this.allThreadMessages.sort((a, b) => a.timestamp - b.timestamp);
    //   }
    // });

  }



  ngOnDestroy() {
    console.log('Chat Conversation Destroyed');
    if (this.channelService.channelSub)
      this.channelService.channelSub.unsubscribe();
  }

  onScroll() {
    console.log('scrolling', this.selectedMessage, "gidilmez", this.allThreadMessages);

    // const messageDaysArray = this.messageDays.toArray();
    // for (let i = 0; i < messageDaysArray.length - 1; i++) {
    //   let currentDay = messageDaysArray[i].nativeElement;
    //   let nextDay = messageDaysArray[i + 1].nativeElement;

    //   let currentDayRect = currentDay.getBoundingClientRect();
    //   let nextDayRect = nextDay.getBoundingClientRect();

    //   if (currentDayRect.bottom >= nextDayRect.top - 5) {
    //     if (currentDay.style.visibility !== 'hidden') {
    //       currentDay.style.visibility = 'hidden';
    //     }
    //   } else {
    //     if (currentDay.style.visibility !== 'visible') {
    //       currentDay.style.visibility = 'visible';
    //     }
    //   }
    // }
  }
}
