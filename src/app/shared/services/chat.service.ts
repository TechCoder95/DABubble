import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../interfaces/chatmessage';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messageSource = new BehaviorSubject<ChatMessage | null>(null);
  public message$ = this.messageSource.asObservable();
  message!: ChatMessage;

  constructor(private databaseService: DatabaseService) {}

  addMessage(message: ChatMessage) {
    this.messageSource.next(message);
    this.message = message;
    /* debugger; */
    this.databaseService.addMessageToChannel(message);
  }
}
