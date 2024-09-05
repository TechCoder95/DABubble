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

  getThread() {
    return this.thread;
  }

  setTicket(ticket: ChatMessage) {
    this.ticket = ticket;
  }

  getTicket() {
    return this.ticket;
  }

  setMessageThread(chatMessage: ChatMessage) {
    this.chatMessage = chatMessage;
  }

  getMessageThread() {
    return this.chatMessage;
  }

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
