import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DABubbleUser } from '../interfaces/user';
import { User } from 'firebase/auth';
import { ChatMessage } from '../interfaces/chatmessage';
import { TextChannel } from '../interfaces/textchannel';
import { Emoji } from '../interfaces/emoji';
import { ThreadChannel } from '../interfaces/thread-channel';

export interface OnlineStatus {
  uid: string;
  onlineUser: string[];
}

@Injectable({
  providedIn: 'root',
})
export class GlobalsubService {
  private userSubject = new Subject<DABubbleUser>();
  private googleUserSubject = new Subject<User>();
  private allMessageSubject = new Subject<ChatMessage>();
  private activeChannelSubject = new Subject<TextChannel>();
  private createChannelSubject = new Subject<TextChannel>();
  private activeThreadSubject = new Subject<ThreadChannel>();
  private emjoiSubject = new Subject<Emoji>();
  private updateTreeSubject = new Subject<void>();
  private activeMessageSubject = new Subject<ChatMessage>();
  private statusSubject = new Subject<OnlineStatus>();

  /**
   * Returns an observable that emits the user subject.
   *
   * @returns {Observable<User>} The observable that emits the user subject.
   */
  getUserObservable() {
    return this.userSubject.asObservable();
  }

  /**
   * Returns an observable that emits the Google user.
   *
   * @returns An observable that emits the Google user.
   */
  getGoogleUserObservable() {
    return this.googleUserSubject.asObservable();
  }

  /**
   * Returns an observable that emits all messages.
   *
   * @returns {Observable<any>} The observable that emits all messages.
   */
  getAllMessageObservable() {
    return this.allMessageSubject.asObservable();
  }

  /**
   * Returns an observable that emits the active channel.
   *
   * @returns An observable that emits the active channel.
   */
  getActiveChannelObservable() {
    return this.activeChannelSubject.asObservable();
  }

  /**
   * Returns an observable that emits the active thread.
   *
   * @returns An observable that emits the active thread.
   */
  getActiveThreadObservable() {
    return this.activeThreadSubject.asObservable();
  }

  /**
   * Returns an observable that emits the emoji subject.
   *
   * @returns {Observable<any>} The observable that emits the emoji subject.
   */
  getEmojiObservable() {
    return this.emjoiSubject.asObservable();
  }

  /**
   * Returns an observable that emits the events when a channel is created.
   *
   * @returns An observable that emits the events when a channel is created.
   */
  getChannelCreatedObservable() {
    return this.createChannelSubject.asObservable();
  }

  /**
   * Returns an observable that emits the updates of the sidenav tree.
   *
   * @returns An observable that emits the updates of the sidenav tree.
   */
  getSidenavTreeObservable() {
    return this.updateTreeSubject.asObservable();
  }

  /**
   * Returns an observable that emits the active message.
   *
   * @returns An observable that emits the active message.
   */
  getActiveMessageObservable() {
    return this.activeMessageSubject.asObservable();
  }

  /**
   * Returns an observable that emits the online status.
   *
   * @returns {Observable<any>} The observable that emits the online status.
   */
  getOnlineStatusObservable() {
    return this.statusSubject.asObservable();
  }

  /**
   * Updates the user data and stores it in the session storage.
   *
   * @param data - The updated user data.
   */
  updateUser(data: DABubbleUser) {
    this.userSubject.next(data);
    sessionStorage.setItem('userLogin', JSON.stringify(data));
  }

  /**
   * Updates the online status.
   *
   * @param data - The data representing the online status.
   */
  updateOnlineStatus(data: OnlineStatus) {
    this.statusSubject.next(data);
  }

  /**
   * Updates the Google user data.
   *
   * @param data - The updated user data.
   */
  updateGoogleUser(data: User) {
    this.googleUserSubject.next(data);
  }

  /**
   * Updates all messages with the given data.
   *
   * @param data - The chat message data to update with.
   */
  updateAllMessages(data: ChatMessage) {
    this.allMessageSubject.next(data);
  }

  /**
   * Updates the active channel with the provided data.
   *
   * @param data - The new active channel data.
   */
  updateActiveChannel(data: TextChannel) {
    this.activeChannelSubject.next(data);
    sessionStorage.setItem('selectedChannel', JSON.stringify(data));
  }

  /**
   * Updates the active thread with the provided data.
   *
   * @param data - The data of the thread channel to update.
   */
  updateActiveThread(data: ThreadChannel) {
    this.activeThreadSubject.next(data);
    sessionStorage.setItem('selectedThread', JSON.stringify(data));
  }

  /**
   * Updates the message and stores it in the session storage.
   *
   * @param data - The chat message to be updated.
   */
  updateMessage(data: ChatMessage) {
    this.allMessageSubject.next(data);
    sessionStorage.setItem('threadMessage', JSON.stringify(data));
  }

  /**
   * Updates the emoji data.
   *
   * @param data - The emoji data to update.
   */
  updateEmoji(data: Emoji) {
    this.emjoiSubject.next(data);
  }

  /**
   * Unsubscribes from the emoji subject.
   */
  deleteEmoji() {
    this.emjoiSubject.unsubscribe();
  }

  /**
   * Updates the created channel with the given data.
   *
   * @param data - The data of the text channel to update.
   */
  updateCreatedChannel(data: TextChannel) {
    this.createChannelSubject.next(data);
  }


  /**
   * Updates the sidenav tree.
   */
  updateSidenavTree() {
    this.updateTreeSubject.next();
  }
}
