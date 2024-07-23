import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../interfaces/chatmessage';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messageSource = new BehaviorSubject<ChatMessage | null>(null);
  currentMessage = this.messageSource.asObservable();
  message!: ChatMessage;
  
  constructor() {}

  changeMessage(message: ChatMessage) {
    this.messageSource.next(message);
    this.message = message;
    console.log(message);
  }
}
