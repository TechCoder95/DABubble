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

  constructor(
    private threadService: ThreadService,
    private chatService: ChatService
  ) { }

  hoverReaction(type: string, hover: boolean) {
    const basePath = './img/message-reaction-';
    const hoverSuffix = hover ? '-hover' : '';

    if (type === 'addReaction') {
      this.addReactionImg = `${basePath}add-reaction${hoverSuffix}.svg`;
    } else if (type === 'answer') {
      this.answerImg = `${basePath}answer${hoverSuffix}.svg`;
    }
  }

  async openThread() {
    this.threadService.setTicket(this.ticket);
    this.threadService.setMessageThread(this.messageForThread);
    await this.threadService.openThread();
  }


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
  openAddReactions() {
    this.addReactionDiv = !this.addReactionDiv;
  }
}
