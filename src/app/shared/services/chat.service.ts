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
  private sendMessages = new BehaviorSubject<ChatMessage | null>(null);
  public sendMessages$ = this.sendMessages.asObservable();

  private receiveMessages = new BehaviorSubject<ChatMessage | null>(null);
  public receiveMessages$ = this.receiveMessages.asObservable();

  constructor(
    private databaseService: DatabaseService,
    private userService: UserService
  ) { }

  async sortMessages(channel: TextChannel) {
    /* debugger; */
    if (channel && channel.conversationId) {
      channel.conversationId.forEach((messageID) => {
        this.databaseService
          .readDataByID('messages', messageID)
          .then((messageFromDb) => {
            /*  debugger; */
            let message = messageFromDb as ChatMessage;
            if (message !== null) {
              if (message.senderName === this.userService.activeUser.username) {
                this.readMessage(message);
              } else {
                this.receiveMessage(message);
              }
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
      console.log("Füge Nachricht dem Kanal hinzu: ", selectedChannelId);

      const messageId = messageExists ? message.id! : messagesFromDb.find((msg) => msg.id === message.id)!.id!;
      await this.databaseService.addMessageToChannel(selectedChannelId, messageId);

      // Aktualisiere die Nachrichten aus der Datenbank
      await this.databaseService.readDatafromDB('messages', messagesFromDb);
      console.log('MESSAGESFROMDB', messagesFromDb);

    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  }

  readMessage(message: ChatMessage) {
    this.sendMessages.next(message);
  }

  receiveMessage(message: ChatMessage) {
    this.receiveMessages.next(message);
  }
}
