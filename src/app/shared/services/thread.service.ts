import { EventEmitter, Injectable, Output } from '@angular/core';
import { UserService } from './user.service';
import { DatabaseService } from './database.service';
import { ThreadChannel } from '../interfaces/thread-channel';
import { ChatMessage } from '../interfaces/chatmessage';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  thread: ThreadChannel;
  selectedThread: boolean = false;
  message!: any;

  @Output() selectedMessage: EventEmitter<ChatMessage> = new EventEmitter();


  constructor(private databaseService: DatabaseService) {
    this.thread = JSON.parse(sessionStorage.getItem('selectedThread') || '{}');
  }

  findSenderByMessageID(messageID: string): void {
    this.databaseService.readDataByField('messages', 'id', messageID).then((message) => {
      // console.log(message, "das ist der geöffnete Thread");
      this.message = message;
      this.selectedMessage.emit(this.message);    
    });
  }

  getThread() {
    return this.thread;
  }

}
