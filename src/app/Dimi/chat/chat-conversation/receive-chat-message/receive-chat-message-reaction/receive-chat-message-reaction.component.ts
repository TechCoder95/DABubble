import { Component, Input } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { ChatService } from '../../../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';
import { ThreadService } from '../../../../../shared/services/thread.service';
import { ChatType } from '../../../../../shared/enums/chattype';

@Component({
  selector: 'app-receive-chat-message-reaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receive-chat-message-reaction.component.html',
  styleUrl: './receive-chat-message-reaction.component.scss',
})
export class ReceiveChatMessageReactionComponent {
  @Input({ required: true }) ticket: any;
  @Input() user!: DABubbleUser;
  @Input() isPrivate!: boolean | undefined;
  @Input({ required: true }) messageForThread!: ChatMessage;
  @Input() chatType: ChatType = ChatType.Channel;

  checkMarkImg = './img/message-reaction-check-mark.svg';
  handsUpImg = './img/message-reaction-hands-up.svg';
  addReactionImg = './img/message-reaction-add-reaction.svg';
  answerImg = './img/message-reaction-answer.svg';

  privateChat!: boolean;

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
   * @param type - The type of reaction ('addReaction' or 'answer').
   * @param hover - Indicates whether the hover effect is active or not.
   */
  hoverReaction(type: string, hover: boolean) {
    const basePath = './img/message-reaction-';
    const hoverSuffix = hover ? '-hover' : '';

    if (type === 'addReaction') {
      this.addReactionImg = `${basePath}add-reaction${hoverSuffix}.svg`;
    } else if (type === 'answer') {
      this.answerImg = `${basePath}answer${hoverSuffix}.svg`;
    }
  }

  /**
   * Opens the chat thread and sets the ticket and message thread.
   * @returns {Promise<void>} A promise that resolves when the thread is opened.
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
      messageId: this.ticket.id!,
      type: emojiType,
      usersIds: [this.user.id!],
      deleted: false,
    };
    this.chatService.sendEmoji(emoji, this.ticket, this.user);
  }

  addReactionDiv: boolean = false;
  /**
   * Opens or closes the add reactions div.
   */
  openAddReactions() {
    this.addReactionDiv = !this.addReactionDiv;
  }
}
