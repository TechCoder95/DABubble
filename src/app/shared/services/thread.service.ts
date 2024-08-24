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


  setThread(thread: ThreadChannel) {
    this.thread = thread;
    // console.log("Teste ob das die richtige Thread ist", this.thread, thread.threadID, this.thread.threadID);

    // this.userService.getOneUserbyId(thread.userID).then((user) => {
    //   console.log("User", user);
    // });

    // die threadID ist die ID des Threads

    this.dataService.readDataByID('threads', thread.channelID)

  }


  getThread() {
    return this.thread;
  }

}
