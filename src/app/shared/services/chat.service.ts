import { Injectable } from '@angular/core';
import { ChatMessage } from '../interfaces/chatmessage';
import { DatabaseService } from './database.service';
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
    private subService: GlobalsubService,
  ) {}

  /**
   * Sends a chat message.
   *
   * @param message - The chat message to send.
   * @returns A promise that resolves when the message is sent.
   */
  async sendMessage(message: ChatMessage) {
    await this.databaseService.addDataToDB('messages', message);
  }

  /**
   * Sets the number of replies and the last replied time for a given chat message.
   *
   * @param message - The chat message to update.
   * @param number - The number of replies to set.
   * @param lastanswerToMsgTime - The timestamp of the last reply.
   */
  setNumberOfReplies(
    message: ChatMessage,
    number: number,
    lastanswerToMsgTime: number,
  ) {
    message.replyNumber = number;
    message.lastRepliedTime = lastanswerToMsgTime;
    this.databaseService.updateDataInDB('messages', message.id!, message);
  }

  /* ==================================================================== */
  /**
   * Sends an emoji with the given parameters.
   *
   * @param newEmoji - The new emoji to be sent.
   * @param message - The chat message to which the emoji will be sent.
   * @param activeUser - The active user sending the emoji.
   * @returns A Promise that resolves when the emoji is sent.
   */
  async sendEmoji(
    newEmoji: Emoji,
    message: ChatMessage,
    activeUser: DABubbleUser,
  ) {
    /* Überprüfen, ob Emoji bei der Nachricht schon existiert */
    if (this.emojiExistsOnMessage(newEmoji, message)) {
      this.handleExistingEmojiOnMessage(newEmoji, message, activeUser);
    } else {
      this.createNewEmojiOnMessage(newEmoji, message);
    }
  }

  /**
   * Creates a new emoji on a chat message.
   *
   * @param newEmoji - The new emoji to be created.
   * @param message - The chat message to add the emoji to.
   * @returns A Promise that resolves to void.
   */
  async createNewEmojiOnMessage(newEmoji: Emoji, message: ChatMessage) {
    /* Wenn Emoji bei Nachricht noch gar nicht existiert */
    newEmoji.id = await this.getNewEmojiId(newEmoji);
    this.subService.updateEmoji(newEmoji);
  }

  /**
   * Handles the existing emoji on a message.
   *
   * @param emoji - The emoji to handle.
   * @param message - The chat message.
   * @param activeUser - The active user.
   */
  handleExistingEmojiOnMessage(
    emoji: Emoji,
    message: ChatMessage,
    activeUser: DABubbleUser,
  ) {
    const existingEmoji: any = this.getExistingEmoji(emoji);
    /* Überprüfen, ob der activeUser schon reagiert hat */
    if (this.userHasAlreadyReacted(emoji, existingEmoji)) {
      this.eliminateUserReaction(existingEmoji, emoji);
    } else {
      this.addUserReaction(existingEmoji, emoji);
    }
  }

  /**
   * Retrieves an existing emoji object based on the provided emoji.
   * @param emoji - The emoji object to search for.
   * @returns The existing emoji object that matches the provided emoji, or undefined if not found.
   */
  getExistingEmoji(emoji: Emoji) {
    return this.allEmojis.find(
      (emojieObject: Emoji) =>
        emojieObject.messageId === emoji.messageId &&
        emojieObject.type === emoji.type,
    );
  }

  /**
   * Eliminates a user's reaction from an existing emoji.
   *
   * @param existingEmoji - The existing emoji object.
   * @param emoji - The emoji object to be eliminated.
   * @returns {Promise<void>} - A promise that resolves when the elimination is complete.
   */
  async eliminateUserReaction(existingEmoji: Emoji, emoji: Emoji) {
    existingEmoji.usersIds = existingEmoji.usersIds.filter(
      (userId) => userId !== emoji.usersIds[0],
    );

    if (existingEmoji.usersIds.length === 0) {
      existingEmoji.deleted = true;
      await this.databaseService.updateDataInDB(
        'emojies',
        existingEmoji.id!,
        existingEmoji,
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

  /**
   * Adds a user reaction to an existing emoji.
   *
   * @param existingEmoji - The existing emoji to add the user reaction to.
   * @param emoji - The emoji containing the user reaction to be added.
   * @returns A Promise that resolves when the user reaction is added.
   */
  async addUserReaction(existingEmoji: Emoji, emoji: Emoji) {
    existingEmoji.usersIds.push(emoji.usersIds[0]);
    await this.databaseService.updateDataInDB(
      'emojies',
      existingEmoji.id!,
      existingEmoji,
    );
    this.subService.updateEmoji(existingEmoji);
  }

  /**
   * Retrieves a new emoji ID from the database.
   *
   * @param emoji - The emoji object to be added to the database.
   * @returns The ID of the newly added emoji.
   */
  async getNewEmojiId(emoji: Emoji) {
    const id = await this.databaseService.addChannelDataToDB('emojies', emoji);
    return id;
  }

  /**
   * Checks if an emoji exists on a given chat message.
   *
   * @param emoji - The emoji to check.
   * @param message - The chat message to check against.
   * @returns A boolean indicating whether the emoji exists on the message.
   */
  emojiExistsOnMessage(emoji: Emoji, message: ChatMessage) {
    return this.allEmojis.some(
      (emojieObject: Emoji) =>
        emojieObject.messageId === emoji.messageId &&
        emojieObject.type === emoji.type,
    );
  }

  /**
   * Checks if a user has already reacted with a specific emoji.
   * @param emoji - The emoji to check.
   * @param existingEmoji - The existing emoji to compare with.
   * @returns A boolean indicating whether the user has already reacted.
   */
  userHasAlreadyReacted(emoji: Emoji, existingEmoji: Emoji): boolean {
    const userHasAlreadyReacted = existingEmoji.usersIds.includes(
      emoji.usersIds[0],
    );
    return userHasAlreadyReacted;
  }

  /* ========================================================== */
  /**
   * Deletes emojis associated with a specific message.
   *
   * @param messageID - The ID of the message.
   * @returns A promise that resolves when all emojis are deleted.
   */
  async deleteEmojisOnMessage(messageID: string) {
    const emojisToDelete = this.allEmojis.filter(
      (emoji: Emoji) => emoji.messageId === messageID,
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
