import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DABubbleUser } from '../interfaces/user';
import { User } from 'firebase/auth';
import { ChatMessage } from '../interfaces/chatmessage';
import { TextChannel } from '../interfaces/textchannel';
import { Emoji } from '../interfaces/emoji';
import { ThreadChannel } from '../interfaces/thread-channel';
import { DatabaseService } from './database.service';

export interface OnlineStatus {
  uid: string;
  onlineUser: string[];
}



@Injectable({
  providedIn: 'root'
})
export class GlobalsubService {

  private userSubject = new Subject<DABubbleUser>();
  private googleUserSubject = new Subject<User>();
  private allMessageSubject = new Subject<ChatMessage>();
  private activeChannelSubject = new Subject<TextChannel>();
  private createChannelSubject = new Subject<TextChannel>();
  private activeThreadSubject = new Subject<ThreadChannel>();
  private emjoiSubject = new Subject<Emoji>();
  private updateUserChangesSubject = new Subject<DABubbleUser>();
  private updateTreeSubject = new Subject<void>();
  private activeMessageSubject = new Subject<ChatMessage>();
  private statusSubject = new Subject<OnlineStatus>();

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

  getEmojiObservable() {
    return this.emjoiSubject.asObservable();
  }

  getChannelCreatedObservable() {
    return this.createChannelSubject.asObservable();
  }

  getUserUpdateFromDatabaseObservable() {
    return this.updateUserChangesSubject.asObservable();
  }

  getSidenavTreeObservable() {
    return this.updateTreeSubject.asObservable();
  }

  getActiveMessageObservable() {
    return this.activeMessageSubject.asObservable();
  }

  //Todo - Add online status observable
  getOnlineStatusObservable() {
    return this.statusSubject.asObservable();
  }

  updateUser(data: DABubbleUser) {
    this.userSubject.next(data);
    sessionStorage.setItem('userLogin', JSON.stringify(data));
  }

  updateOnlineStatus(data: OnlineStatus) {
    this.statusSubject.next(data);
  }

  updateGoogleUser(data: User) {
    this.googleUserSubject.next(data);
  }

  updateAllMessages(data: ChatMessage) {
    this.allMessageSubject.next(data);
  }

  updateActiveChannel(data: TextChannel) {
    this.activeChannelSubject.next(data);
    sessionStorage.setItem('selectedChannel', JSON.stringify(data));
  }

  updateActiveThread(data: ThreadChannel) {
    this.activeThreadSubject.next(data);
    sessionStorage.setItem('selectedThread', JSON.stringify(data));
  }


  updateMessage(data: ChatMessage) {
    this.allMessageSubject.next(data);
    sessionStorage.setItem('threadMessage', JSON.stringify(data));
  }


  updateEmoji(data: Emoji) {
    this.emjoiSubject.next(data);
  }

  deleteEmoji() {
    this.emjoiSubject.unsubscribe();
  }

  updateCreatedChannel(data: TextChannel) {
    this.createChannelSubject.next(data);
  }

  updateUserFromDatabaseChange(data: DABubbleUser) {
    this.updateUserChangesSubject.next(data);
  }

  updateSidenavTree() {
    this.updateTreeSubject.next();
  }
}


