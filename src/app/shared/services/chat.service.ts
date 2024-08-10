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



  constructor(
    private databaseService: DatabaseService,
    private userService: UserService,
    private subService : GlobalsubService
  ) {}

  async sendMessage(message: ChatMessage) {
    try {
      let messagesFromDb: ChatMessage[] = [];
      // Lese die vorhandenen Nachrichten aus der Datenbank
      await this.databaseService.readDatafromDB('messages', messagesFromDb);
      // Überprüfe, ob eine Nachricht mit der gleichen ID bereits existiert
      const messageExists = messagesFromDb.some((msg) => msg.id === message.id);
      if (!messageExists) {
        // Nachricht existiert nicht, füge sie hinzu
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

      messagesFromDb = [];
      // Aktualisiere die Nachrichten aus der Datenbank
      await this.databaseService.readDatafromDB('messages', messagesFromDb);
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  }
 
}
