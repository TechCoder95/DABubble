import { EventEmitter, Injectable, Output } from '@angular/core';
import { DatabaseService } from './database.service';
import { ThreadChannel } from '../interfaces/thread-channel';
import { ChatMessage } from '../interfaces/chatmessage';
import { Router } from '@angular/router';
import { GlobalsubService } from './globalsub.service';
import { UserService } from './user.service';
import { MobileService } from './mobile.service';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  thread: ThreadChannel;
  selectedThread: boolean = false;
  message!: any;
  ticket!: ChatMessage;
  chatMessage!: ChatMessage;

  @Output() selectedMessage: EventEmitter<ChatMessage> = new EventEmitter();

  constructor(
    private userService: UserService,
    private databaseService: DatabaseService,
    private router: Router,
    private subService: GlobalsubService,
    private mobileService: MobileService,
  ) {
    this.thread = JSON.parse(sessionStorage.getItem('selectedThread') || '{}');
  }

  /**
   * Retrieves the current thread.
   *
   * @returns The current thread.
   */
  getThread() {
    return this.thread;
  }

  /**
   * Sets the ticket for the thread service.
   *
   * @param ticket - The chat message representing the ticket.
   */
  setTicket(ticket: ChatMessage) {
    this.ticket = ticket;
  }

  /**
   * Retrieves the ticket.
   *
   * @returns The ticket.
   */
  getTicket() {
    return this.ticket;
  }

  /**
   * Sets the message thread for the chat.
   *
   * @param chatMessage - The chat message to set as the message thread.
   */
  setMessageThread(chatMessage: ChatMessage) {
    this.chatMessage = chatMessage;
  }

  /**
   * Retrieves the message thread.
   *
   * @returns The chat message thread.
   */
  getMessageThread() {
    return this.chatMessage;
  }

  /**
   * Opens a thread.
   *
   * This method performs the necessary operations to open a thread. It closes any existing thread, sets the selected thread flag to true, retrieves the active user, creates a new thread channel object, retrieves the selected channel from session storage, retrieves the thread from the database if it exists, adds the thread to the database if it doesn't exist, updates the active thread in the subscription service, sets the selected thread in session storage, sets the thread message in session storage, and navigates to the appropriate route based on the device type.
   *
   * @returns {Promise<void>} A promise that resolves when the thread is opened.
   */
  async openThread() {
    this.close();
    this.selectedThread = true;
    let user = this.userService.activeUser;

    let thread: ThreadChannel = {
      messageID: this.ticket.id!,
      channelID: this.ticket.channelId,
      userID: user.id!,
      messages: [],
      id: '',
    };

    const selectedChannel = await JSON.parse(
      sessionStorage.getItem('selectedChannel') || '{}',
    );
    const threadFromDB = await this.databaseService.getThreadByMessage(
      thread.messageID,
    );

    if (threadFromDB === null) {
      await this.databaseService.addDataToDB('threads', thread).then((res) => {
        thread.id! = res;
      });
    } else {
      thread.id = threadFromDB.id;
    }
    sessionStorage.setItem('selectedThread', JSON.stringify(thread));

    this.subService.updateActiveThread(thread);

    sessionStorage.setItem('threadMessage', JSON.stringify(this.chatMessage));

    if (!this.mobileService.isMobile) {
      this.router.navigate(['home/channel/' + selectedChannel.id]);
      setTimeout(() => {
        this.router.navigate([
          'home/channel/' + selectedChannel.id + '/thread/' + thread.id,
        ]);
      }, 0.1);
    } else {
      this.router.navigate(['/channel/' + selectedChannel.id]);
      setTimeout(() => {
        this.router.navigate(['thread', thread.id]);
      }, 0.1);
    }
  }

  /**
   * Closes the selected thread.
   * Removes the selected thread and thread message from the session storage.
   * Navigates to the home channel or channel based on the device type.
   */
  close() {
    this.selectedThread = false;
    sessionStorage.removeItem('selectedThread');
    sessionStorage.removeItem('threadMessage');
    if (!this.mobileService.isMobile) {
      this.router.navigate([
        'home/channel/' +
          JSON.parse(sessionStorage.getItem('selectedChannel')!).id,
      ]);
    } else {
      this.router.navigate([
        '/channel/' + JSON.parse(sessionStorage.getItem('selectedChannel')!).id,
      ]);
    }
  }
}
