import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TextChannel } from '../interfaces/textchannel';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private selectedChannelSubject = new BehaviorSubject<TextChannel | null>(null);
  selectedChannel$ = this.selectedChannelSubject.asObservable();

  selectChannel(channel: TextChannel) {
    this.selectedChannelSubject.next(channel);
  }
}