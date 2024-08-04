import { Component, Input } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { ChatService } from '../../../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receive-chat-message-reaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receive-chat-message-reaction.component.html',
  styleUrl: './receive-chat-message-reaction.component.scss',
})
export class ReceiveChatMessageReactionComponent {
  checkMarkImg = './img/message-reaction-check-mark.png';
  handsUpImg = './img/message-reaction-hands-up.png';
  addReactionImg = './img/message-reaction-add-reaction.png';
  answerImg = './img/message-reaction-answer.png';
  @Input() receivedMessage!: ChatMessage;
  @Input() user!: DABubbleUser;

  constructor(private chatService: ChatService) {}

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
    }
  }

  handleEmojis(emojiType: string) {
    debugger;
    let emoji: Emoji = {
      messageId: this.receivedMessage.id!,
      type: emojiType,
      usersIds: [this.user.id!],
    };
    this.chatService.sendEmoji(emoji, this.receivedMessage, this.user);
  }
}
