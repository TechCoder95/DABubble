import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChannelService } from '../../../../../shared/services/channel.service';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { ChatService } from '../../../../../shared/services/chat.service';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { DatabaseService } from '../../../../../shared/services/database.service';
import { ThreadService } from '../../../../../shared/services/thread.service';
import { ThreadChannel } from '../../../../../shared/interfaces/thread-channel';
import { GlobalsubService } from '../../../../../shared/services/globalsub.service';
import { Router } from '@angular/router';

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
  @Output() editModeChange = new EventEmitter<boolean>();
  @Output() deleteStatusChange = new EventEmitter<boolean>();
  @Input() sendMessage!: ChatMessage;
  @Input() user!: DABubbleUser;
  @Input() ticket: any;
  @Input() isPrivate!: boolean | undefined;
  @Input({ required: true }) messageForThread!: ChatMessage;

  constructor(
    private channelService: ChannelService,
    private threadService: ThreadService,
    private chatService: ChatService,
    private dataService: DatabaseService,
    private subService: GlobalsubService,
    private router: Router
  ) {}

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

  async openThread() {
    this.threadService.close();
    this.threadService.selectedThread = true;

    let thread: ThreadChannel = {
      messageID: this.ticket.id!,
      channelID: this.ticket.channelId,
      userID: this.user.id!,
      messages: [],
      id: ''
    }

    const selectedChannel = await JSON.parse(sessionStorage.getItem('selectedChannel') || '{}');
    const threadFromDB = await this.dataService.getThreadByMessage(thread.messageID);

    if (threadFromDB === null) {
      await this.dataService.addDataToDB('threads', thread).then((res) => {
        thread.id! = res;
      });
    }
    else {
      thread.id = threadFromDB.id;
    }
    sessionStorage.setItem('selectedThread', JSON.stringify(thread));

    this.subService.updateActiveThread(thread);

    sessionStorage.setItem('threadMessage', JSON.stringify(this.messageForThread));
    this.router.navigate(['home/channel/' + selectedChannel.id]);
    setTimeout(() => {
      this.router.navigate(['home/channel/' + selectedChannel.id + "/thread/" + thread.id]);
    }, 0.1);
  }

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
  openAddReactions() {
    this.addReactionDiv = !this.addReactionDiv;
  }
}
