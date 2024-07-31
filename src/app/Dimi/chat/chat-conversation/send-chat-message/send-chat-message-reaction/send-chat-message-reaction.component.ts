import { Component } from '@angular/core';

@Component({
  selector: 'app-send-chat-message-reaction',
  standalone: true,
  imports: [],
  templateUrl: './send-chat-message-reaction.component.html',
  styleUrl: './send-chat-message-reaction.component.scss',
})
export class SendChatMessageReactionComponent {
  checkMarkImg = './img/message-reaction-check-mark.png';
  handsUpImg = './img/message-reaction-hands-up.png';
  addReactionImg = './img/message-reaction-add-reaction.png';
  answerImg = './img/message-reaction-answer.png';
  editMessageImg = './img/message-reaction-edit-message.png';

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
      this.editMessageImg = `${basePath}edit-message${hoverSuffix}.png`;
    }
  }
}
