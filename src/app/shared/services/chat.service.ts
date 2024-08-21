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
  async sendEmoji(
    newEmoji: Emoji,
    message: ChatMessage,
    activeUser: DABubbleUser
  ) {
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

  handleExistingEmojiOnMessage(
    emoji: Emoji,
    message: ChatMessage,
    activeUser: DABubbleUser
  ) {
    const existingEmoji: any = this.getExistingEmoji(emoji);
    /* Überprüfen, ob der activeUser schon reagiert hat */
    if (this.userHasAlreadyReacted(emoji, existingEmoji)) {
      this.eliminateUserReaction(existingEmoji, emoji);
    } else {
      this.addUserReaction(existingEmoji, emoji);
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
   async deleteEmojisOnMessage(messageID: string) {
    const emojisToDelete = this.allEmojis.filter(
      (emoji: Emoji) => emoji.messageId === messageID
    );
    
    for (const emoji of emojisToDelete) {
      emoji.deleted = true;
      emoji.usersIds = [];
      await this.databaseService.updateDataInDB('emojies', emoji.id!, emoji);
      await this.databaseService.deleteDataFromDB('emojies', emoji.id!);
      this.subService.updateEmoji(emoji);
    }
  }
}
