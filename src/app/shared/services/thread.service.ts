import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { DatabaseService } from './database.service';
import { ThreadChannel } from '../interfaces/thread-channel';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  private thread: ThreadChannel;
  selectedThread: boolean = false;

  constructor() {
    this.thread = JSON.parse(sessionStorage.getItem('selectedThread') || '{}');
  }


  setThread(thread: ThreadChannel) {
    this.thread = thread;

    // die threadID ist die ID des Threads


  }


  getThread() {
    return this.thread;
  }

}
