import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messageSource = new BehaviorSubject<string>('');
  currentMessage$ = this.messageSource.asObservable();

  constructor() {}

  changeMessage(message: string) {
    this.messageSource.next(message);
  }
}
