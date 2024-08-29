import { Injectable } from '@angular/core';
import { ThreadMessage } from '../interfaces/threadmessage';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})

export class TicketService {
  private _ticket: any;

  constructor(private databaseService: DatabaseService) {

  }

  setTicket(ticket: any) {
    this._ticket = ticket;
  }

  getTicket() {
    return this._ticket;
  }

  // addConversationToThread(thread: ThreadMessage) {
  //   this.databaseService.addChannelDataToDB('threads', thread);
  //   this.pushThreadsToChats(thread)
  // }
  
  // pushThreadsToChats(thread: ThreadMessage) {
  //   this.databaseService.addChannelDataToDB('chats', thread);

  //   console.log(this.databaseService.addChannelDataToDB('chats', thread), "hande");
    
  // }

}
