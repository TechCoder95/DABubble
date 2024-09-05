import { Component, Input, OnInit } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { CommonModule } from '@angular/common';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { UserService } from '../../../../../shared/services/user.service';
import { ChatService } from '../../../../../shared/services/chat.service';
import { Subscription } from 'rxjs';
import { GlobalsubService } from '../../../../../shared/services/globalsub.service';

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
  @Input() messageType!: string;
  emojiUsersText: string = '';
  private emojiSubscription!: Subscription;

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private subService: GlobalsubService,
  ) {}

  ngOnInit() {
    this.emojiSubscription = this.subService
      .getEmojiObservable()
      .subscribe((emoji: Emoji) => {
        if (
          emoji.messageId === this.emoji.messageId &&
          emoji.type === this.emoji.type
        ) {
          this.loadEmojiReactions(emoji);
        }
      });

    this.loadEmojiReactions(this.emoji);
  }

  ngOnDestroy() {
    if (this.emojiSubscription) {
      this.emojiSubscription.unsubscribe();
    }
  }

  /**
   * Retrieves the image path for a given emoji.
   *
   * @param emoji - The emoji object.
   * @returns The image path for the emoji.
   */
  getEmojiImg(emoji: Emoji) {
    switch (emoji.type) {
      case 'checkMark':
        return '/img/checkMarkEmoji.svg';
      case 'handsUp':
        return '/img/reaction-handsUp.svg';
      case 'nerdFace':
        return '/img/message-reaction-nerd-face.svg';
      case 'rocket':
        return '/img/message-reaction-rocket.svg';
      case 'demon':
        return '/img/emojis/demon.svg';
      case 'love':
        return '/img/emojis/love.svg';
      case 'happy':
        return '/img/emojis/laughing.svg';
      case 'sad':
        return '/img/emojis/sad.svg';
      case 'angry':
        return '/img/emojis/angry.svg';
      case 'cute':
        return '/img/emojis/cute.svg';
      case 'cry':
        return '/img/emojis/cry.svg';
      case 'kiss':
        return '/img/emojis/kiss.svg';
      case 'sarcastic':
        return '/img/emojis/sarcastic.svg';
      case 'money':
        return '/img/emojis/money.svg';
      default:
        return '';
    }
  }

  /**
   * Returns the number of users who have reacted with the specified emoji.
   *
   * @param emoji - The emoji to get the reactions amount for.
   * @returns The number of users who have reacted with the specified emoji.
   */
  getEmojiReactionsAmount(emoji: Emoji): number {
    return emoji.usersIds.length;
  }

  /**
   * Handles the click event for the reaction component.
   * Sends the current emoji, message, and active user to the chat service.
   * @returns A promise that resolves when the emoji is sent.
   */
  async handleClick() {
    let currentEmoji: Emoji = {
      messageId: this.emoji.messageId,
      type: this.emoji.type,
      usersIds: [this.activeUser.id!],
      deleted: false,
    };
    await this.chatService.sendEmoji(
      currentEmoji,
      this.message,
      this.activeUser,
    );
  }

  /**
   * Loads the emoji reactions for a given emoji.
   *
   * @param emoji - The emoji for which to load the reactions.
   * @returns A Promise that resolves to void.
   */
  async loadEmojiReactions(emoji: Emoji) {
    let emojiReactors: string[] = [];

    for (let id of emoji.usersIds) {
      let user = await this.userService.getOneUserbyId(id);
      if (user && user.username) {
        let username = user.username;
        if (user.id === this.activeUser.id) {
          username = 'Du';
        }
        emojiReactors.push(username);
      }
    }
    this.emojiUsersText = this.usersReactionString(emojiReactors);
  }

  /**
   * Generates a string representing the users' reaction to a message.
   *
   * @param emojiReactors - An array of strings representing the users who reacted with emojis.
   * @returns A string representing the users' reaction.
   */
  usersReactionString(emojiReactors: string[]): string {
    if (emojiReactors.length === 1 && emojiReactors[0] === 'Du') {
      return `<strong class="reactorNames">${emojiReactors[0]}</strong> hast reagiert`;
    } else if (emojiReactors.length === 1 && !emojiReactors.includes('du')) {
      return `<strong>${emojiReactors[0]}</strong> hat reagiert`;
    } else if (emojiReactors.length === 2) {
      return `<strong>${emojiReactors[0]}</strong> und <strong>${emojiReactors[1]}</strong> haben reagiert`;
    } else if (emojiReactors.length > 2) {
      const lastUser = emojiReactors.pop();
      return `<strong>${emojiReactors.join(
        ', ',
      )}</strong> und <strong>${lastUser}</strong> haben reagiert`;
    } else {
      return emojiReactors.join('');
    }
  }
}
