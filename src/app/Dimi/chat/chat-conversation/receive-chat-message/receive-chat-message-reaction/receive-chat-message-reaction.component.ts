import { Component, Input } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { ChatService } from '../../../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../../../shared/services/channel.service';
import { TicketService } from '../../../../../shared/services/ticket.service';
import { EmojiService } from '../../../../../shared/services/emoji.service';

@Component({
  selector: 'app-receive-chat-message-reaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receive-chat-message-reaction.component.html',
  styleUrl: './receive-chat-message-reaction.component.scss',
})
export class ReceiveChatMessageReactionComponent {
  @Input() ticket: any;
  @Input() user!: DABubbleUser;
  @Input() isPrivate!: boolean | undefined;
  checkMarkImg = './img/message-reaction-check-mark.svg';
  handsUpImg = './img/message-reaction-hands-up.svg';
  addReactionImg = './img/message-reaction-add-reaction.svg';
  answerImg = './img/message-reaction-answer.svg';

  constructor(
    private channelService: ChannelService,
    private ticketService: TicketService,
    private emojiService: EmojiService
  ) {}

  hoverReaction(type: string, hover: boolean) {
    const basePath = './img/message-reaction-';
    const hoverSuffix = hover ? '-hover' : '';

    // if (type === 'checkMark') {
    //   this.checkMarkImg = `${basePath}check-mark${hoverSuffix}.png`;
    // } else if (type === 'handsUp') {
    //   this.handsUpImg = `${basePath}hands-up${hoverSuffix}.png`;
    if (type === 'addReaction') {
      this.addReactionImg = `${basePath}add-reaction${hoverSuffix}.svg`;
    } else if (type === 'answer') {
      this.answerImg = `${basePath}answer${hoverSuffix}.svg`;
    }
  }

  openMessage() {
    this.channelService.showSingleThread = true;
    this.ticketService.setTicket(this.ticket);
  }

  handleEmojis(emojiType: string) {
    let emoji: Emoji = {
      messageId: this.ticket.id!,
      type: emojiType,
      usersIds: [this.user.id!],
    };
    this.emojiService.sendEmoji(emoji, this.ticket);
  }
}
