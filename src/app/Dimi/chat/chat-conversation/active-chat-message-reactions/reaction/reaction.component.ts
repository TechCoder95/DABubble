import { Component, Input } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { CommonModule } from '@angular/common';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { DatabaseService } from '../../../../../shared/services/database.service';
import { UserService } from '../../../../../shared/services/user.service';
import { ChatService } from '../../../../../shared/services/chat.service';

@Component({
  selector: 'app-reaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reaction.component.html',
  styleUrl: './reaction.component.scss',
})
export class ReactionComponent {
  @Input() emoji!: Emoji;
  @Input() activeUser!: DABubbleUser;
  @Input() message!: any;

  constructor(
    private userService: UserService,
    private chatService: ChatService
  ) {}

  getEmojiImg(emoji: Emoji) {
    if (emoji.type === 'checkMark') {
      return './img/checkMarkEmoji.svg';
    } else if (emoji.type === 'handsUp') {
      return './img/reaction-handsUp.svg';
    } else {
      return;
    }
  }

  getEmojiReactionsAmount(emoji: Emoji): number {
    return emoji.usersIds.length;
  }

  getEmojiReactionUsers(): string {
    let emojiReactors: string[] = [];

    this.emoji.usersIds.forEach((id) => {
      let user = this.userService.getOneUserbyId(id);
      if (user && user.username) {
        let username = user.username;
        if (user.id === this.activeUser.id) {
          username = 'Du';
        }
        emojiReactors.push(username);
      }
    });
    return this.usersReactionString(emojiReactors);
  }

  usersReactionString(emojiReactors: string[]): string {
    if (emojiReactors.length === 1 && emojiReactors[0] === 'Du') {
      return `<strong>${emojiReactors[0]}</strong> hast reagiert`;
    } else if (emojiReactors.length === 1 && !emojiReactors.includes('du')) {
      return `<strong>${emojiReactors[0]}</strong> hat reagiert`;
    } else if (emojiReactors.length === 2) {
      return `<strong>${emojiReactors[0]}</strong> und <strong>${emojiReactors[1]}</strong> haben reagiert`;
    } else if (emojiReactors.length > 2) {
      const lastUser = emojiReactors.pop();
      return `${emojiReactors.join(', ')} und ${lastUser} haben reagiert`;
    } else {
      return emojiReactors.join('');
    }
  }

  /* handleClick(emoji: Emoji) {
    this.chatService.sendEmoji(emoji, this.message);
  } */
}
