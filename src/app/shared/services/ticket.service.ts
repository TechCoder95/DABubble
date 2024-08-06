import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TicketService {
  private _ticket: any;

  setTicket(ticket: any) {
    this._ticket = ticket;
  }

  getTicket() {
    return this._ticket;
  }
}
