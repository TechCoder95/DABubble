import { Component, Input, OnInit } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { CommonModule } from '@angular/common';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { UserService } from '../../../../../shared/services/user.service';
import { ChatService } from '../../../../../shared/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reaction.component.html',
  styleUrl: './reaction.component.scss',
})
export class ReactionComponent implements OnInit {
  @Input() emoji!: Emoji;
  @Input() activeUser!: DABubbleUser;
  @Input() message!: any;
  emojiUsersText: string = '';
  private reactionSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private chatService: ChatService
  ) {}

  async ngOnInit() {
    this.reactionSubscription = this.chatService.reactionsUpdated.subscribe(
      (reactionString: string) => {
        this.emojiUsersText = reactionString;
      }
    );
    this.emojiUsersText = await this.chatService.loadEmojiReactions(
      this.emoji,
      this.activeUser
    );

  }

  ngOnDestroy() {
    if (this.reactionSubscription) {
      this.reactionSubscription.unsubscribe();
    }
  }

  getEmojiImg(emoji: Emoji) {
    if (emoji.type === 'checkMark') {
      return './img/checkMarkEmoji.svg';
    } else if (emoji.type === 'handsUp') {
      return './img/reaction-handsUp.svg';
    } else if (emoji.type === 'nerdFace') {
      return './img/message-reaction-nerd-face.svg';
    } else if (emoji.type === 'rocket') {
      return './img/message-reaction-rocket.svg';
    } else {
      return;
    }
  }

  getEmojiReactionsAmount(emoji: Emoji): number {
    return emoji.usersIds.length;
  }

  async handleClick() {
    let currentEmoji: Emoji = {
      messageId: this.emoji.messageId,
      type: this.emoji.type,
      usersIds: [this.activeUser.id!],
      deleted: false,
    };
    await this.chatService.sendEmoji(currentEmoji, this.message, this.activeUser);
  }
}
