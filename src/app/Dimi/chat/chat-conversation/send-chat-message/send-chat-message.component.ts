import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { SendChatMessageReactionComponent } from './send-chat-message-reaction/send-chat-message-reaction.component';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../../shared/services/database.service';
import { ActiveChatMessageReactionsComponent } from '../active-chat-message-reactions/active-chat-message-reactions.component';
import { EmojisPipe } from '../../../../shared/pipes/emojis.pipe';
import { DAStorageService } from '../../../../shared/services/dastorage.service';
import { ActualMessageComponent } from './actual-send-message/actual-message.component';
import { ThreadService } from '../../../../shared/services/thread.service';
import { ChatType } from '../../../../shared/enums/chattype';

@Component({
  selector: 'app-send-chat-message',
  standalone: true,
  imports: [
    CommonModule,
    SendChatMessageReactionComponent,
    FormsModule,
    ActiveChatMessageReactionsComponent,
    EmojisPipe,
    ActualMessageComponent,
  ],
  templateUrl: './send-chat-message.component.html',
  styleUrl: './send-chat-message.component.scss',
})
export class SendChatMessageComponent implements OnInit {
  @Input() user!: DABubbleUser;
  @Input() sendMessage!: ChatMessage;
  @Input() isPrivate!: boolean | undefined;
  @Input() index!: number;
  inEditMessageMode: boolean = false;
  messageDeleted: boolean = false;
  @ViewChild('mainContainer') mainContainer!: ElementRef;
  originalMessage!: string;
  emojiType!: string;
  /* @Output() valueChanged = new EventEmitter<string>(); */
  activeChatMessageReactionsComponent: any;
  @Input() repeatedMessage!: boolean | undefined;
  @Input() repeatedMessageInUnder5Minutes!: boolean | undefined;
  @Input() chatType: ChatType = ChatType.Channel;

  @ViewChild(SendChatMessageReactionComponent)
  sendChatMessageReactionComponent!: SendChatMessageReactionComponent;

  constructor(
    private databaseService: DatabaseService,
    private storageService: DAStorageService,
    private chatService: ChatService,
    public threadService: ThreadService,
  ) {
    this.user = JSON.parse(sessionStorage.getItem('userLogin')!);
  }

  userFromSession: DABubbleUser = JSON.parse(
    sessionStorage.getItem('userLogin')!,
  );

  ngOnInit(): void {
    this.originalMessage = this.sendMessage.message;
    if (this.sendMessage.fileUrl) {
      this.getImage();
    }
  }

  /**
   * Opens the chat thread.
   */
  onOpenThread() {
    if (this.sendChatMessageReactionComponent) {
      this.sendChatMessageReactionComponent.openThread();
    }
  }

  /**
   * Retrieves the username of the user from the session.
   * 
   * @returns {Promise<string>} The username of the user.
   */
  async getUserName() {
    return this.userFromSession.username;
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

  /**
   * Retrieves the user's avatar.
   * 
   * @returns The user's avatar.
   */
  async getUserAvatar() {
    return this.userFromSession.avatar;
  }

  /**
   * Handles the change of edit mode for the chat message.
   * 
   * @param event - A boolean value indicating whether the edit mode is enabled or disabled.
   */
  onEditModeChange(event: boolean) {
    this.inEditMessageMode = event;
  }

  /**
   * Cancels the current chat message editing mode.
   */
  cancel() {
    this.sendMessage.message = this.originalMessage;
    this.mainContainer.nativeElement.style.background = 'unset';
    this.inEditMessageMode = false;
  }

  /**
   * Saves the chat message by updating it in the database.
   * Sets the background of the main container to 'unset'.
   * Marks the message as edited.
   * Updates the message in the database.
   * Exits the edit message mode.
   * 
   * @returns {Promise<void>} A promise that resolves when the message is saved.
   */
  async save() {
    this.mainContainer.nativeElement.style.background = 'unset';
    this.sendMessage.edited = true;
    await this.databaseService.updateDataInDB(
      'messages',
      this.sendMessage.id!,
      this.sendMessage,
    );
    this.inEditMessageMode = false;
  }

  /**
   * Deletes a chat message.
   *
   * @param event - A boolean indicating whether the message is deleted or not.
   * @returns Promise<void> - A promise that resolves when the message is deleted.
   */
  async onDelete(event: boolean) {
    this.messageDeleted = event;
    this.sendMessage.message = '';
    this.sendMessage.deleted = true;
    if (this.sendMessage.fileUrl) {
      this.storageService.deleteMessageImage(this.sendMessage.fileUrl);
    }
    await this.chatService.deleteEmojisOnMessage(this.sendMessage.id!);
    await this.databaseService.updateDataInDB(
      'messages',
      this.sendMessage.id!,
      this.sendMessage,
    );
  }

  /**
   * Handles the change event of the emoji.
   * 
   * @param event - The emoji change event.
   */
  onEmojiChange(event: string) {
    this.emojiType = event;
  }

  sentImage = '';
  /**
   * Retrieves and sets the image source for the chat message.
   * @returns {Promise<void>} A promise that resolves when the image source is set.
   */
  async getImage() {
    let imgSrc = await this.storageService.downloadMessageImage(
      this.sendMessage.fileUrl!,
    );
    this.sentImage = imgSrc;
  }
}
