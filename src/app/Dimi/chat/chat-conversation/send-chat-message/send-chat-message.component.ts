import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
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
    ActualMessageComponent
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

  constructor(
    private databaseService: DatabaseService,
    private storageService: DAStorageService,
    private chatService: ChatService,
    public threadService: ThreadService
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

  async getUserName() {
    return this.userFromSession.username;
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

  async getUserAvatar() {
    return this.userFromSession.avatar;
  }

  onEditModeChange(event: boolean) {
    this.inEditMessageMode = event;
  }

  cancel() {
    this.sendMessage.message = this.originalMessage;
    this.mainContainer.nativeElement.style.background = 'unset';
    this.inEditMessageMode = false;
  }

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

  onEmojiChange(event: string) {
    this.emojiType = event;
  }

  sentImage = '';
  async getImage() {
    let imgSrc = await this.storageService.downloadMessageImage(
      this.sendMessage.fileUrl!,
    );
    this.sentImage = imgSrc;
  }

 /*  sentImageExists() {
    return this.sendMessage.imageUrl && this.sendMessage.imageUrl.trim() !== '';
  }

  getLinkedUserNames(): string[] {
    return this.sendMessage.linkedUsers.map((user) => `@${user.username}`);
  } */
}
