import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../interfaces/chatmessage';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messageSource = new BehaviorSubject<ChatMessage | null>(null);
  currentMessage = this.messageSource.asObservable();
  message!: ChatMessage;

  constructor(private databaseService: DatabaseService) {}

  changeMessage(message: ChatMessage) {
    this.messageSource.next(message);
    this.message = message;
    console.log(message);
    debugger;
    this.databaseService.addMessageToChannel(message);
  }

  /* addMessage(){
    const messageDocRef = doc(this.firestore, "channels", );
  } */
}
