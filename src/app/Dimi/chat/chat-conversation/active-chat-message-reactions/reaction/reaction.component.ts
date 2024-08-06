import { Component, Input } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { CommonModule } from '@angular/common';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { DatabaseService } from '../../../../../shared/services/database.service';
import { UserService } from '../../../../../shared/services/user.service';

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

  constructor(private userService: UserService) {}

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
          username = 'du';
        }
        emojiReactors.push(username);
      }
    });
    return this.usersReactionString(emojiReactors);
  }

  usersReactionString(emojiReactors: string[]): string {
    if (emojiReactors.length === 1 && emojiReactors[0] === 'du') {
      return 'Du hast reagiert';
    }

    if (emojiReactors.length > 1) {
      const lastUser = emojiReactors.pop();
      return `${emojiReactors.join(', ')} und ${lastUser} haben reagiert`;
    } else {
      return emojiReactors.join('');
    }
  }
}
