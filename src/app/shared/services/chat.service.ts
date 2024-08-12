import { Injectable, OnDestroy, OnInit } from '@angular/core';
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
    private subService : GlobalsubService
  ) {}

  async sendMessage(message: ChatMessage) {
    await this.databaseService.addDataToDB('messages', message);
  }




  /* ==================================================================== */
  async sendEmoji(newEmoji: Emoji, message: ChatMessage) {


    //Todo Dome: 



    // let emojisFromDB: Emoji[] = [];

    // /* Lese die vorhandenen Emojies aus der Datenbank */
    // await this.databaseService.readDatafromDB('emojies', emojisFromDB);

    // /* Überprüfen, ob Emoji bei der Nachricht schon existiert */
    // if (this.emojiExistsOnMessage(newEmoji, emojisFromDB)) {
    //   this.handleExistingEmojiOnMessage(newEmoji, emojisFromDB);
    // } else {
    //   this.createNewEmojiOnMessage(newEmoji);
    // }
    // await this.databaseService.readDatafromDB('emojies', emojisFromDB);





  }

  async createNewEmojiOnMessage(newEmoji: Emoji) {
    /* Wenn Emoji bei Nachricht noch gar nicht existiert */
    newEmoji.id = await this.getNewEmojiId(newEmoji);
    this.subService.updateEmoji(newEmoji);
  }

  handleExistingEmojiOnMessage(
    emoji: Emoji,
   /*  message: ChatMessage, */
    emojisFromDB: Emoji[]
  ) {
    const existingEmoji: any = this.getExistingEmoji(emoji, emojisFromDB);
    /* Überprüfen, ob der activeUser schon reagiert hat */
    if (this.userHasAlreadyReacted(emoji, existingEmoji)) {
      this.eliminateUserReaction(existingEmoji, emoji);
    } else {
      this.addUserReaction(existingEmoji, emoji);
    }
  }

  getExistingEmoji(emoji: Emoji, emojisFromDB: Emoji[]) {
    const foundEmoji = emojisFromDB.find(
      (emojieObject: Emoji) =>
        emojieObject.messageId === emoji.messageId &&
        emojieObject.type === emoji.type
    );
    return foundEmoji;
  }

  getExistentDocId(emoji: Emoji, message: ChatMessage, emojisFromDB: Emoji[]) {
    const emojiDoc = emojisFromDB.find(
      (emojieObject) =>
        emojieObject.messageId === message.id &&
        emojieObject.type === emoji.type
    );
    return emojiDoc ? emojiDoc.id : undefined;
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
      await this.databaseService.updateDataInDB(
        'emojies',
        existingEmoji.id!,
        existingEmoji
      );
      this.subService.updateEmoji(existingEmoji);
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

  emojiExistsOnMessage(emoji: Emoji, emojisFromDB: Emoji[]) {
    const emojiExistsOnMessage = emojisFromDB.some(
      (emojieObject: Emoji) =>
        emojieObject.messageId === emoji.messageId &&
        emojieObject.type === emoji.type
    );
    return emojiExistsOnMessage;
  }

  userHasAlreadyReacted(emoji: Emoji, existingEmoji: Emoji): boolean {
    const userHasAlreadyReacted = existingEmoji.usersIds.includes(
      emoji.usersIds[0]
    );
    return userHasAlreadyReacted;
  }

  /* ========================================================== */
}
