import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../interfaces/chatmessage';
import { DatabaseService } from './database.service';
import { TextChannel } from '../interfaces/textchannel';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messageSource = new BehaviorSubject<ChatMessage | null>(null);
  public message$ = this.messageSource.asObservable();
  message!: ChatMessage;

  private sendMessages = new BehaviorSubject<ChatMessage | null>(null);
  public sendMessages$ = this.sendMessages.asObservable();

  private receiveMessages = new BehaviorSubject<ChatMessage | null>(null);
  public receiveMessages$ = this.receiveMessages.asObservable();

  constructor(
    private databaseService: DatabaseService,
    private userService: UserService
  ) {}

  addMessage(message: ChatMessage) {
    this.messageSource.next(message);
    this.message = message;
    /* debugger; */
    this.databaseService.addDataToDB('messages', message);
  }

  sortMessages(channel: TextChannel) {
    if (channel && channel.conversationId) {
      channel.conversationId.forEach((messageID) => {
        this.databaseService
          .readDataByID('messages', messageID)
          .then((messageFromDb) => {
            let message = messageFromDb as ChatMessage;
            if (message.sender === this.userService.activeUser.username) {
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

  sendMessage(message: ChatMessage) {
    let messagesFromDb: ChatMessage[] = [];
    this.sendMessages.next(message);
    this.databaseService.addDataToDB('messages', message).then(() => {
      this.databaseService
        .readDatafromDB('messages', messagesFromDb)
        .then(() => {
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
    });
  }

  readMessage(message: ChatMessage) {
    this.sendMessages.next(message);
  }

  receiveMessage(message: ChatMessage) {
    this.receiveMessages.next(message);
  }
}
