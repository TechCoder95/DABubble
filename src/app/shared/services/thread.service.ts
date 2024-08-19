import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { DatabaseService } from './database.service';
import { ThreadChannel } from '../interfaces/thread-channel';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  private thread: ThreadChannel;
  threadID!: string;

  constructor(private userService: UserService, private dataService: DatabaseService) {
    this.thread = JSON.parse(sessionStorage.getItem('selectedThread') || '{}');
  }

  ngOnInit(): void {

  }


  setThread(thread: ThreadChannel) {
    this.thread = thread;
    // console.log("Teste ob das die richtige Thread ist", this.thread, thread.threadID, this.thread.threadID);

    // this.userService.getOneUserbyId(thread.userID).then((user) => {
    //   console.log("User", user);
    // });

    // die threadID ist die ID des Threads

    this.dataService.readDataByID('threads', thread.channelID).then((thread) => {
      // this.threadID = thread.threadID;
      // console.log("Thread", thread);

    });



  }


  getThread() {
    return this.thread;
  }

  findUserById(id: number) {

  }
}
