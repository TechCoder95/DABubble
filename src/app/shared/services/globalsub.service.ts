import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DABubbleUser } from '../interfaces/user';
import { User } from 'firebase/auth';
import { ChatMessage } from '../interfaces/chatmessage';
import { TextChannel } from '../interfaces/textchannel';
import { ThreadMessage } from '../interfaces/threadmessage';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalsubService {

  private userSubject = new Subject<DABubbleUser>();
  private googleUserSubject = new Subject<User>();
  private allMessageSubject = new Subject<ChatMessage>();
  private activeChannelSubject = new Subject<TextChannel>();
  private activeThreadSubject = new Subject<ThreadMessage>();


  constructor() {
    
   }







  
  getUserObservable() {
    return this.userSubject.asObservable();
  }

  getGoogleUserObservable() {
    return this.googleUserSubject.asObservable();
  }

  getAllMessageObservable() {
    return this.allMessageSubject.asObservable();
  }

  getActiveChannelObservable() {
    return this.activeChannelSubject.asObservable();
  }

  getActiveThreadObservable() {
    return this.activeThreadSubject.asObservable();
  }




  publishUser(data: DABubbleUser) {
    this.userSubject.next(data);
  }

  publishGoogleUser(data: User) {
    this.googleUserSubject.next(data);
  }

  publishAllMessage(data: ChatMessage) {
    this.allMessageSubject.next(data);
  }

  publishActiveChannel(data: TextChannel) {
    this.activeChannelSubject.next(data);
  }

  publishActiveThread(data: ThreadMessage) {
    this.activeThreadSubject.next(data);
  }




  updateUser(data: DABubbleUser) {
    this.publishUser(data);
  }

  updateGoogleUser(data: User) {
    this.publishGoogleUser(data);
  }

  updateAllMessages(data: ChatMessage) {
    this.publishAllMessage(data);
  }

  updateActiveChannel(data: TextChannel) {
    this.publishActiveChannel(data);
  }

  updateActiveThread(data: ThreadMessage) {
    this.publishActiveThread(data);
  }
}


