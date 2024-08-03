import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { DatabaseService } from '../../../../../shared/services/database.service';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { ChatService } from '../../../../../shared/services/chat.service';

@Component({
  selector: 'app-send-chat-message-reaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './send-chat-message-reaction.component.html',
  styleUrl: './send-chat-message-reaction.component.scss',
})
export class SendChatMessageReactionComponent {
  checkMarkImg = './img/message-reaction-check-mark.png';
  handsUpImg = './img/message-reaction-hands-up.png';
  addReactionImg = './img/message-reaction-add-reaction.png';
  answerImg = './img/message-reaction-answer.png';
  editMessageImg = './img/message-reaction-edit-message.png';
  showEditMessageDialog: boolean = false;
  isInEditMode: boolean = false;
  messageDeleted: boolean = false;
  emojiType!: string;
  @Output() editModeChange = new EventEmitter<boolean>();
  @Output() deleteStatusChange = new EventEmitter<boolean>();
  @Input() sendMessage!: ChatMessage;
  @Input() user!: DABubbleUser;

  constructor(
    private databaseService: DatabaseService,
    private chatService: ChatService
  ) {}

  hoverReaction(type: string, hover: boolean) {
    const basePath = './img/message-reaction-';
    const hoverSuffix = hover ? '-hover' : '';

    if (type === 'checkMark') {
      this.checkMarkImg = `${basePath}check-mark${hoverSuffix}.png`;
    } else if (type === 'handsUp') {
      this.handsUpImg = `${basePath}hands-up${hoverSuffix}.png`;
    } else if (type === 'addReaction') {
      this.addReactionImg = `${basePath}add-reaction${hoverSuffix}.png`;
    } else if (type === 'answer') {
      this.answerImg = `${basePath}answer${hoverSuffix}.png`;
    } else if (type === 'edit') {
      if (!this.showEditMessageDialog) {
        this.editMessageImg = `${basePath}edit-message${hoverSuffix}.png`;
      }
    }
  }

  editMessageDialog() {
    this.showEditMessageDialog = !this.showEditMessageDialog;
    if (this.showEditMessageDialog) {
      this.editMessageImg = './img/message-reaction-edit-message-hover.png';
    } else {
      this.editMessageImg = './img/message-reaction-edit-message.png';
    }
  }

  editMessage() {
    this.isInEditMode = true;
    this.editModeChange.emit(this.isInEditMode);
  }

  deleteMessage() {
    this.messageDeleted = true;
    this.deleteStatusChange.emit(this.messageDeleted);
  }

  async handleEmojis(emojiType: string) {
    debugger;
    let emoji: Emoji = {
      messageId: this.sendMessage.id!,
      type: emojiType,
      usersIds: [this.user.id!],
    };
    this.chatService.sendEmoji(emoji, this.sendMessage, this.user);
  }
}
