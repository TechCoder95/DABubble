import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { ChatService } from '../../../../../shared/services/chat.service';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { ThreadService } from '../../../../../shared/services/thread.service';
import { ChatType } from '../../../../../shared/enums/chattype';
@Component({
  selector: 'app-send-chat-message-reaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './send-chat-message-reaction.component.html',
  styleUrl: './send-chat-message-reaction.component.scss',
})
export class SendChatMessageReactionComponent {
  checkMarkImg = './img/message-reaction-check-mark.svg';
  handsUpImg = './img/message-reaction-hands-up.svg';
  addReactionImg = './img/message-reaction-add-reaction.svg';
  answerImg = './img/message-reaction-answer.svg';
  editMessageImg = './img/message-reaction-edit-message.svg';
  showEditMessageDialog: boolean = false;
  isInEditMode: boolean = false;
  messageDeleted: boolean = false;
  emojiType!: string;
  privateChat!: boolean;
  @Output() editModeChange = new EventEmitter<boolean>();
  @Output() deleteStatusChange = new EventEmitter<boolean>();
  @Input() sendMessage!: ChatMessage;
  @Input() user!: DABubbleUser;
  @Input() ticket: any;
  @Input() isPrivate!: boolean | undefined;
  @Input({ required: true }) messageForThread!: ChatMessage;
  @Input() chatType: ChatType = ChatType.Channel;

  constructor(
    private threadService: ThreadService,
    private chatService: ChatService,
  ) {
    this.privateChat = JSON.parse(
      sessionStorage.getItem('selectedChannel')!,
    ).isPrivate;
  }

  /**
   * Handles the hover effect for chat message reactions.
   *
   * @param type - The type of reaction.
   * @param hover - Indicates whether the reaction is being hovered or not.
   */
  hoverReaction(type: string, hover: boolean) {
    const basePath = './img/message-reaction-';
    const hoverSuffix = hover ? '-hover' : '';

    if (type === 'addReaction') {
      this.addReactionImg = `${basePath}add-reaction${hoverSuffix}.svg`;
    } else if (type === 'answer') {
      this.answerImg = `${basePath}answer${hoverSuffix}.svg`;
    } else if (type === 'edit') {
      if (!this.showEditMessageDialog) {
        this.editMessageImg = `${basePath}edit-message${hoverSuffix}.svg`;
      }
    }
  }

  /**
   * Toggles the edit message dialog and updates the edit message image accordingly.
   */
  editMessageDialog() {
    this.showEditMessageDialog = !this.showEditMessageDialog;
    if (this.showEditMessageDialog) {
      this.editMessageImg = './img/message-reaction-edit-message-hover.svg';
    } else {
      this.editMessageImg = './img/message-reaction-edit-message.svg';
    }
  }

  /**
   * Enables the edit mode for the chat message.
   * Emits an event to notify the parent component about the change in edit mode.
   */
  editMessage() {
    this.isInEditMode = true;
    this.editModeChange.emit(this.isInEditMode);
  }

  /**
   * Marks the message as deleted and emits an event to notify the parent component.
   */
  deleteMessage() {
    this.messageDeleted = true;
    this.deleteStatusChange.emit(this.messageDeleted);
  }

  /**
   * Opens a thread for the chat conversation.
   * Sets the ticket and message thread for the thread service.
   * Waits for the thread to be opened.
   */
  async openThread() {
    this.threadService.setTicket(this.ticket);
    this.threadService.setMessageThread(this.messageForThread);
    await this.threadService.openThread();
  }

  /**
   * Handles the selection of an emoji.
   *
   * @param emojiType - The type of emoji selected.
   */
  handleEmojis(emojiType: string) {
    let emoji: Emoji = {
      messageId: this.sendMessage.id!,
      type: emojiType,
      usersIds: [this.user.id!],
      deleted: false,
    };
    this.chatService.sendEmoji(emoji, this.sendMessage, this.user);
  }

  addReactionDiv: boolean = false;
  /**
   * Opens or closes the add reaction div.
   */
  openAddReactions() {
    this.addReactionDiv = !this.addReactionDiv;
  }
}
