import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChatMessage } from '../interfaces/chatmessage';
import { DatabaseService } from './database.service';
import { TextChannel } from '../interfaces/textchannel';
import { UserService } from './user.service';
import { Emoji } from '../interfaces/emoji';
import { DABubbleUser } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private sendMessages = new BehaviorSubject<ChatMessage | null>(null);
  public sendMessages$ = this.sendMessages.asObservable();

  private receiveMessages = new BehaviorSubject<ChatMessage | null>(null);
  public receiveMessages$ = this.receiveMessages.asObservable();

  private sendMessagesEmoji = new BehaviorSubject<Emoji | null>(null);
  public sendMessagesEmoji$ = this.sendMessagesEmoji.asObservable();

  constructor(
    private databaseService: DatabaseService,
    private userService: UserService
  ) {}

  async sortMessages(channel: TextChannel) {
    /* debugger; */
    if (channel && channel.conversationId) {
      channel.conversationId.forEach((messageID) => {
        this.databaseService
          .readDataByID('messages', messageID)
          .then((messageFromDb) => {
            /*  debugger; */
            let message = messageFromDb as ChatMessage;
            if (message.senderName === this.userService.activeUser.username) {
              this.readMessage(message);
            } else {
              this.receiveMessage(message);
            }
          });
      });
    } else {
      console.log('KEINE NACHRICHTEN');
    }
  }

  async sendMessage(message: ChatMessage) {
    try {
      let messagesFromDb: ChatMessage[] = [];
      // Lese die vorhandenen Nachrichten aus der Datenbank
      await this.databaseService.readDatafromDB('messages', messagesFromDb);
      // Überprüfe, ob eine Nachricht mit der gleichen ID bereits existiert
      const messageExists = messagesFromDb.some((msg) => msg.id === message.id);
      if (!messageExists) {
        // Nachricht existiert nicht, füge sie hinzu
        this.sendMessages.next(message);
        await this.databaseService.addDataToDB('messages', message);
      }
      // Füge die Nachricht zum Kanal hinzu
      const selectedChannelId = sessionStorage.getItem('selectedChannelId')!;
      const messageId = messageExists
        ? message.id!
        : messagesFromDb.find((msg) => msg.id === message.id)!.id!;
      await this.databaseService.addMessageToChannel(
        selectedChannelId,
        messageId
      );

      // Aktualisiere die Nachrichten aus der Datenbank
      await this.databaseService.readDatafromDB('messages', messagesFromDb);
      console.log('MESSAGESFROMDB', messagesFromDb);
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }

    /* sendMessage(message: ChatMessage) {
    let messagesFromDb: ChatMessage[] = [];

    /* this.sendMessages.next(message);
    this.databaseService.addDataToDB('messages', message).then(() => {
      this.databaseService
        .readDatafromDB('messages', messagesFromDb)
        .then(() => {
          debugger;
          console.log('MESSAGESFROMDB' + messagesFromDb);
          messagesFromDb.forEach((messageInArray) => {
            if (
              messageInArray.channelId ===
                sessionStorage.getItem('selectedChannelId') &&
              messageInArray.timestamp === message.timestamp
            ) {
              let messageDocId = messageInArray.id;
              console.log(messageDocId);
              this.databaseService.addMessageToChannel(
                sessionStorage.getItem('selectedChannelId')!,
                messageDocId!
              );
            }
          });
        });
    }); */
  }

  readMessage(message: ChatMessage) {
    this.sendMessages.next(message);
  }

  receiveMessage(message: ChatMessage) {
    this.receiveMessages.next(message);
  }

  /* ==================================================================== */
  async sendEmoji(
    emoji: Emoji,
    message: ChatMessage,
    activeUser: DABubbleUser
  ) {
    let emojisFromDB: Emoji[] = [];

    /* Lese die vorhandenen Emojies aus der Datenbank */
    await this.databaseService.readDatafromDB('emojies', emojisFromDB);
    
    /* Überprüfen, ob Emoji bei der Nachricht schon existiert */
    if (this.emojiExistsOnMessage(emoji, message, emojisFromDB)) {
      this.handleExistingEmojiOnMessage(emoji, message, emojisFromDB,activeUser);
    } else {
      /* Wenn Emoji bei Nachricht noch gar nicht existiert */
      emoji.id = await this.getNewEmojiId(emoji);
      await this.databaseService.addEmojiToMessage(emoji.messageId, emoji.id!);
    }
    this.sendMessagesEmoji.next(emoji);
  }

  handleExistingEmojiOnMessage(
    emoji: Emoji,
    message: ChatMessage,
    emojisFromDB: Emoji[],
    activeUser:DABubbleUser
  ) {
    emoji.id = this.getExistentDocId(emoji, message, emojisFromDB);
    /* Überprüfen, ob der activeUser schon reagiert hat */
    if (this.userHasAlreadyReacted(emoji, activeUser)) {
      this.eliminateUserReaction(emoji, activeUser);
    } else {
      this.addUserReaction(emoji, activeUser);
    }
  }

  async addUserReaction(emoji: Emoji, activeUser: DABubbleUser) {
    emoji.usersIds.push(activeUser.id!);
    await this.databaseService.updateDataInDB('emojies', emoji.id!, emoji);
  }

  async eliminateUserReaction(emoji: Emoji, activeUser: DABubbleUser) {
    const activeUserId = activeUser.id;
    emoji.usersIds = emoji.usersIds.filter((userId) => userId !== activeUserId);

    if (emoji.usersIds.length === 0) {
      await this.databaseService.deleteDataFromDB('emojies', emoji.id!);
      await this.databaseService.removeEmojiFromMessage(
        emoji.messageId,
        emoji.id!
      );
    } else {
      await this.databaseService.updateDataInDB('emojies', emoji.id!, emoji);
    }
  }

  getExistentDocId(emoji: Emoji, message: ChatMessage, emojisFromDB: Emoji[]) {
    const emojiDoc = emojisFromDB.find(
      (emojieObject) =>
        emojieObject.messageId === message.id &&
        emojieObject.type === emoji.type
    );
    return emojiDoc ? emojiDoc.id : undefined;
  }

  async getNewEmojiId(emoji: Emoji) {
    const id = await this.databaseService.addChannelDataToDB('emojies', emoji);
    return id;
  }

  emojiExistsOnMessage(
    emoji: Emoji,
    message: ChatMessage,
    emojisFromDB: Emoji[]
  ) {
    const emojiExistsOnMessage = emojisFromDB.some(
      (emojieObject: any) =>
        emojieObject.messageId === message.id &&
        emojieObject.type === emoji.type
    );
    return emojiExistsOnMessage;
  }

  userHasAlreadyReacted(emoji: Emoji, activeUser: DABubbleUser) {
    debugger;
    const userHasAlreadyReacted = emoji.usersIds.includes(activeUser.id!);
    return userHasAlreadyReacted;
  }
}
