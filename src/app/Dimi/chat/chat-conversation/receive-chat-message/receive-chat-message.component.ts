import { Component, Input, ViewChild } from '@angular/core';
import { ChatMessage } from '../../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../shared/services/user.service';
import { ReceiveChatMessageReactionComponent } from './receive-chat-message-reaction/receive-chat-message-reaction.component';
import { ActiveChatMessageReactionsComponent } from '../active-chat-message-reactions/active-chat-message-reactions.component';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { DAStorageService } from '../../../../shared/services/dastorage.service';
import { EmojisPipe } from '../../../../shared/pipes/emojis.pipe';
import { ActualReceiveMessageComponent } from './actual-receive-message/actual-receive-message.component';
import { ChatService } from '../../../../shared/services/chat.service';
import { ThreadService } from '../../../../shared/services/thread.service';
import { ChatType } from '../../../../shared/enums/chattype';

@Component({
  selector: 'app-receive-chat-message',
  standalone: true,
  imports: [
    CommonModule,
    ReceiveChatMessageReactionComponent,
    ActiveChatMessageReactionsComponent,
    EmojisPipe,
    ActualReceiveMessageComponent,
  ],
  templateUrl: './receive-chat-message.component.html',
  styleUrl: './receive-chat-message.component.scss',
})
export class ReceiveChatMessageComponent {
  @Input() receiveMessage!: ChatMessage;
  @Input() user!: DABubbleUser;
  @Input() isPrivate!: boolean | undefined;
  @Input() repeatedMessage!: boolean | undefined;
  @Input() repeatedMessageInUnder5Minutes!: boolean | undefined;
  @Input() sender!: DABubbleUser;
  @Input() chatType: ChatType = ChatType.Channel;

  @ViewChild(ReceiveChatMessageReactionComponent) receiveChatMessageReactionComponent!: ReceiveChatMessageReactionComponent;


  senderUser: DABubbleUser = {
    username: 'dummy',
    avatar: './img/avatar.svg',
    mail: '',
    isLoggedIn: false,
  };

  constructor(
    private userService: UserService,
    private storageService: DAStorageService,
    public chatService: ChatService,
    public threadService: ThreadService
  ) { }

  ngOnInit(): void {
    this.getUser();
    if (this.receiveMessage.fileUrl) {
      this.getImage();
    }
  }

  onOpenThread() {
    if (this.receiveChatMessageReactionComponent) {
      this.receiveChatMessageReactionComponent.openThread();
    }
  }

  async getUser() {
    this.senderUser.avatar = './img/avatar.svg';
    let user = await this.userService.getOneUserbyId(
      this.receiveMessage.senderId,
    );
    this.senderUser = user;
  }

  checkDate(date: number): string {
    const today = new Date();
    const givenDate = new Date(date);

    if (givenDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      return 'Heute';
    } else {
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(givenDate);
    }
  }

  receivedImgMessage = '';
  async getImage() {
    let imgSrc = await this.storageService.downloadMessageImage(
      this.receiveMessage.fileUrl!,
    );

    this.receivedImgMessage = imgSrc;
  }

  isNotRepeatedMessageInUnder5Minuten() {
    return (
      !this.repeatedMessage ||
      (this.repeatedMessage && !this.repeatedMessageInUnder5Minutes)
    );
  }
}
