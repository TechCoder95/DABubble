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

  @ViewChild(ReceiveChatMessageReactionComponent)
  receiveChatMessageReactionComponent!: ReceiveChatMessageReactionComponent;

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
    public threadService: ThreadService,
  ) {}

  ngOnInit(): void {
    this.getUser();
    if (this.receiveMessage.fileUrl) {
      this.getImage();
    }
  }

  /**
   * Opens the chat thread.
   */
  onOpenThread() {
    if (this.receiveChatMessageReactionComponent) {
      this.receiveChatMessageReactionComponent.openThread();
    }
  }

  /**
   * Retrieves the user information for the sender of the chat message.
   * Sets the avatar of the sender user to './img/avatar.svg'.
   * 
   * @returns {Promise<void>} A promise that resolves when the user information is retrieved and the sender user is updated.
   */
  async getUser() {
    this.senderUser.avatar = './img/avatar.svg';
    let user = await this.userService.getOneUserbyId(
      this.receiveMessage.senderId,
    );
    this.senderUser = user;
  }

  /**
   * Checks the given date and returns a string representation of it.
   * If the given date is today, it returns 'Heute'.
   * Otherwise, it formats the given date using the 'de-DE' locale and returns the formatted string.
   *
   * @param date - The date to be checked.
   * @returns A string representation of the given date.
   */
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
  /**
   * Retrieves and sets the image source for the received chat message.
   * @returns {Promise<void>} A promise that resolves once the image source is set.
   */
  async getImage() {
    let imgSrc = await this.storageService.downloadMessageImage(
      this.receiveMessage.fileUrl!,
    );

    this.receivedImgMessage = imgSrc;
  }

  /**
   * Checks if the chat message is not a repeated message within 5 minutes.
   * @returns {boolean} Returns true if the message is not repeated within 5 minutes, otherwise false.
   */
  isNotRepeatedMessageInUnder5Minuten() {
    return (
      !this.repeatedMessage ||
      (this.repeatedMessage && !this.repeatedMessageInUnder5Minutes)
    );
  }
}
