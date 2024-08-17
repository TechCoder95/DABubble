import { Component, Input } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { ChatService } from '../../../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../../../shared/services/channel.service';
import { TicketService } from '../../../../../shared/services/ticket.service';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../../../shared/services/database.service';
import { ThreadChannel } from '../../../../../shared/interfaces/thread-channel';


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
  checkMarkImg = './img/message-reaction-check-mark.svg';
  handsUpImg = './img/message-reaction-hands-up.svg';
  addReactionImg = './img/message-reaction-add-reaction.svg';
  answerImg = './img/message-reaction-answer.svg';

  constructor(
    private channelService: ChannelService,
    private ticketService: TicketService,
    private chatService: ChatService,
    private router: Router,
    private dataService: DatabaseService
  ) { }

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

    let thread: ThreadChannel = {
      messageID: this.ticket.id!,
      channelID: this.ticket.channelId,
      userID: this.user.id!
    }

    this.dataService.addDataToDB('threads', thread).then((res) => {
      thread.threadID = res;
      this.router.navigate(['home', this.ticket.channelId, thread.threadID]);
      sessionStorage.setItem('selectedThread', JSON.stringify(thread));
      console.log('Thread created', thread);
    });
    
    this.chatService.setThread(thread);
  }

  /* async updateEmojiText() {
    this.emojiUsersText = await this.chatService.loadEmojiUsers(
      this.emoji,
      this.activeUser
    );
  } */

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
