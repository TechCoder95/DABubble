import { Injectable } from '@angular/core';
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
}
