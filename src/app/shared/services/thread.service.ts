import { EventEmitter, Injectable, Output } from '@angular/core';
import { DatabaseService } from './database.service';
import { ThreadChannel } from '../interfaces/thread-channel';
import { ChatMessage } from '../interfaces/chatmessage';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  thread: ThreadChannel;
  selectedThread: boolean = false;
  message!: any;

  @Output() selectedMessage: EventEmitter<ChatMessage> = new EventEmitter();


  constructor(private databaseService: DatabaseService, private router: Router) {
    this.thread = JSON.parse(sessionStorage.getItem('selectedThread') || '{}');
  }

  findSenderByMessageID(messageID: string): void {
    this.databaseService.readDataByField('messages', 'id', messageID).then((message) => {
      this.message = message;
      this.selectedMessage.emit(this.message);
    });
  }

  getThread() {
    return this.thread;
  }

  close() {
    sessionStorage.removeItem('selectedThread');
    sessionStorage.removeItem('threadMessage');
    this.router.navigate(['home/channel/' + JSON.parse(sessionStorage.getItem('selectedChannel')!).id]);
  }

}
