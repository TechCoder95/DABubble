import { EventEmitter, Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChatMessage } from '../interfaces/chatmessage';
import { DatabaseService } from './database.service';
import { TextChannel } from '../interfaces/textchannel';
import { UserService } from './user.service';
import { Emoji } from '../interfaces/emoji';
import { DABubbleUser } from '../interfaces/user';
import { GlobalsubService } from './globalsub.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  allEmojis: Emoji[] = [];

  constructor(
    private databaseService: DatabaseService,
    private userService: UserService,
    private subService: GlobalsubService
  ) {}

  async sendMessage(message: ChatMessage) {
    await this.databaseService.addDataToDB('messages', message);
  }

  /* ==================================================================== */
  async sendEmoji(newEmoji: Emoji, message: ChatMessage, activeUser:DABubbleUser) {
    /* Überprüfen, ob Emoji bei der Nachricht schon existiert */
    if (this.emojiExistsOnMessage(newEmoji, message)) {
      this.handleExistingEmojiOnMessage(newEmoji, message, activeUser);
    } else {
      this.createNewEmojiOnMessage(newEmoji, message);
    }
  }

  async createNewEmojiOnMessage(newEmoji: Emoji, message: ChatMessage) {
    /* Wenn Emoji bei Nachricht noch gar nicht existiert */
    newEmoji.id = await this.getNewEmojiId(newEmoji);
    this.subService.updateEmoji(newEmoji);
  }

  handleExistingEmojiOnMessage(emoji: Emoji, message: ChatMessage, activeUser:DABubbleUser) {
    const existingEmoji: any = this.getExistingEmoji(emoji);
    /* Überprüfen, ob der activeUser schon reagiert hat */
    if (this.userHasAlreadyReacted(emoji, existingEmoji)) {
      this.eliminateUserReaction(existingEmoji, emoji);
      this.loadEmojiReactions(existingEmoji,activeUser);
    } else {
      this.addUserReaction(existingEmoji, emoji);
      this.loadEmojiReactions(existingEmoji,activeUser);
    }
  }

  getExistingEmoji(emoji: Emoji) {
    return this.allEmojis.find(
      (emojieObject: Emoji) =>
        emojieObject.messageId === emoji.messageId &&
        emojieObject.type === emoji.type
    );
  }

  async eliminateUserReaction(existingEmoji: Emoji, emoji: Emoji) {
    existingEmoji.usersIds = existingEmoji.usersIds.filter(
      (userId) => userId !== emoji.usersIds[0]
    );

    if (existingEmoji.usersIds.length === 0) {
      existingEmoji.deleted = true;
      await this.databaseService.updateDataInDB(
        'emojies',
        existingEmoji.id!,
        existingEmoji
      );
      this.databaseService.deleteDataFromDB('emojies', existingEmoji.id!);
      this.subService.updateEmoji(existingEmoji);
    } else {
      this.databaseService
        .updateDataInDB('emojies', existingEmoji.id!, existingEmoji)
        .then(() => {
          this.subService.updateEmoji(existingEmoji);
        });
    }
  }

  async addUserReaction(existingEmoji: Emoji, emoji: Emoji) {
    existingEmoji.usersIds.push(emoji.usersIds[0]);
    await this.databaseService.updateDataInDB(
      'emojies',
      existingEmoji.id!,
      existingEmoji
    );
    this.subService.updateEmoji(existingEmoji);
  }

  async getNewEmojiId(emoji: Emoji) {
    const id = await this.databaseService.addChannelDataToDB('emojies', emoji);
    return id;
  }

  emojiExistsOnMessage(emoji: Emoji, message: ChatMessage) {
    return this.allEmojis.some(
      (emojieObject: Emoji) =>
        emojieObject.messageId === emoji.messageId &&
        emojieObject.type === emoji.type
    );
  }

  userHasAlreadyReacted(emoji: Emoji, existingEmoji: Emoji): boolean {
    const userHasAlreadyReacted = existingEmoji.usersIds.includes(
      emoji.usersIds[0]
    );
    return userHasAlreadyReacted;
  }

  /* ========================================================== */
  reactionsUpdated: EventEmitter<string> = new EventEmitter();
  async loadEmojiReactions(emoji: Emoji, activeUser: DABubbleUser) {
    let emojiReactors: string[] = [];

    for (let id of emoji.usersIds) {
      let user = await this.userService.getOneUserbyId(id);
      if (user && user.username) {
        let username = user.username;
        if (user.id === activeUser.id) {
          username = 'Du';
        }
         emojiReactors.push(username);
      }
    }
     let reactionString = this.usersReactionString(emojiReactors);
      this.reactionsUpdated.emit(reactionString);
      return reactionString;
    /* return this.usersReactionString(emojiReactors); */
  }

  usersReactionString(emojiReactors: string[]): string {
    if (emojiReactors.length === 1 && emojiReactors[0] === 'Du') {
      return `<strong class="reactorNames">${emojiReactors[0]}</strong> hast reagiert`;
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
}
