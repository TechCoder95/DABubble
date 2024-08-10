import { Injectable, OnInit } from '@angular/core';
import { Emoji } from '../interfaces/emoji';
import { UserService } from './user.service';
import { DatabaseService } from './database.service';
import { ChatService } from './chat.service';
import { GlobalsubService } from './globalsub.service';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../interfaces/chatmessage';

@Injectable({
  providedIn: 'root'
})
export class EmojiService implements OnInit {

  private databaseSubscription!: Subscription;

  currentEmoji!: Emoji;


  allEmojis: Emoji[] = [];

  constructor(
    private userService: UserService,
    private databaseService: DatabaseService,
    private chatService: ChatService,
    private subService: GlobalsubService
  ) { }


  ngOnInit(): void {
    this.loadEmojis();
  }

  loadEmojis() {

    this.databaseSubscription = this.subService.getEmojiObservable().subscribe((emoji: Emoji) => {
      if (emoji) {
        const existingEmojiIndex = this.getExistingEmojiIndex(emoji);
        if (this.emojiAlreadyExists(existingEmojiIndex)) {
          this.handleExistingEmoji(emoji, existingEmojiIndex);
        }
        else {
          this.allEmojis.push(emoji);
        }
        this.currentEmoji = emoji;
      }
    });
  }

  emojiAlreadyExists(existingEmojiIndex: number) {
    return existingEmojiIndex !== -1;
  }

  getExistingEmojiIndex(emoji: Emoji) {
    return this.allEmojis.findIndex((e) => e.type === emoji.type && e.messageId === emoji.messageId);
  }

  handleExistingEmoji(newEmoji: Emoji, existingEmojiIndex: number) {
    const existingEmoji = this.allEmojis[existingEmojiIndex];
    if (newEmoji.usersIds.length === 0) {
      // Entferne den Emoji, wenn die neue Emoji-Liste leer ist
      this.allEmojis.splice(existingEmojiIndex, 1);
    } else if (!this.areUserIdsEqual(existingEmoji.usersIds, newEmoji.usersIds)) {
      // Aktualisiere den Emoji, wenn die Benutzer-IDs unterschiedlich sind
      this.allEmojis[existingEmojiIndex] = newEmoji;
    }
  }

  areUserIdsEqual(usersIds1: string[], usersIds2: string[]) {
    if (usersIds1.length !== usersIds2.length) {
      return false;
    }
    const sortedIds1 = [...usersIds1].sort();
    const sortedIds2 = [...usersIds2].sort();
    return sortedIds1.every((id, index) => id === sortedIds2[index]);
  }

  emojiExists(emoji: Emoji) {
    return this.allEmojis.some((e) => e.type === emoji.type && e.messageId === emoji.messageId);
  }




  async sendEmoji(newEmoji: Emoji, message: ChatMessage) {
    let emojisFromDB: Emoji[] = [];

    /* Lese die vorhandenen Emojies aus der Datenbank */
    await this.databaseService.readDatafromDB('emojies', emojisFromDB);

    /* Überprüfen, ob Emoji bei der Nachricht schon existiert */
    if (this.emojiExistsOnMessage(newEmoji, emojisFromDB)) {
      this.handleExistingEmojiOnMessage(newEmoji, emojisFromDB);
    } else {
      this.createNewEmojiOnMessage(newEmoji);
    }
    await this.databaseService.readDatafromDB('emojies', emojisFromDB);
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
      this.databaseService.deleteDataFromDB('emojies', existingEmoji.id!).then(() => {
        this.loadEmojis();
      }
      );
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



}
