import { EventEmitter, Injectable, Output } from '@angular/core';
import { UserService } from './user.service';
import { DatabaseService } from './database.service';
import { ThreadChannel } from '../interfaces/thread-channel';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  private thread: ThreadChannel;
  selectedThread: boolean = false;
  threadOwner!: any;

  @Output() selectedThreadOwner: EventEmitter<any> = new EventEmitter();

  
  constructor(private databaseService: DatabaseService) {
    this.thread = JSON.parse(sessionStorage.getItem('selectedThread') || '{}');
  }

  findSenderByMessageID(messageID: string): void {
    this.databaseService.readDataByID('messages', messageID).then((message) => {
      console.log(message, "oclas");
      this.threadOwner = message;
      this.selectedThreadOwner.emit(this.threadOwner);

      console.log(this.threadOwner.senderName, "senderName");
      
    });
  }


  setThread(thread: ThreadChannel) {
    this.thread = thread;

    // die threadID ist die ID des Threads


  }


  getThread() {
    return this.thread;
  }

}
