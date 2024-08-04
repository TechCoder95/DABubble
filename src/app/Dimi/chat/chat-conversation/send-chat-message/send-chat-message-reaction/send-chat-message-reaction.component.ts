import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ChannelService } from '../../../../../shared/services/channel.service';

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
  @Output() editModeChange = new EventEmitter<boolean>();
  @Output() deleteStatusChange = new EventEmitter<boolean>();

  constructor(private channelService: ChannelService) { }

  hoverReaction(type: string, hover: boolean) {
    const basePath = './img/message-reaction-';
    const hoverSuffix = hover ? '-hover' : '';

    // if (type === 'checkMark') {
    //   this.checkMarkImg = `${basePath}check-mark${hoverSuffix}.png`;
    // } else if (type === 'handsUp') {
    //   this.handsUpImg = `${basePath}hands-up${hoverSuffix}.svg`;
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

  editMessageDialog() {
    this.showEditMessageDialog = !this.showEditMessageDialog;
    if (this.showEditMessageDialog) {
      this.editMessageImg = './img/message-reaction-edit-message-hover.svg';
    } else {
      this.editMessageImg = './img/message-reaction-edit-message.svg';
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

  openMessage() {
    this.channelService.showSingleThread = true;
  }
}
