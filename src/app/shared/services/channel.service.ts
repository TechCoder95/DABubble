import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TextChannel } from '../interfaces/textchannel';
import { DatabaseService } from './database.service';
import { Firestore, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private selectedChannelSubject = new BehaviorSubject<TextChannel | null>(
    null
  );

  constructor(private databaseService: DatabaseService) {}
  selectedChannel$ = this.selectedChannelSubject.asObservable();
  channel!: TextChannel;

  selectChannel(channel: TextChannel) {
    this.selectedChannelSubject.next(channel);
    this.channel = channel;
  }

  async updateChannelName(updatedName: string) {
    debugger;
    const currentChannel = this.selectedChannelSubject.value;
    const updatedChannel = { ...currentChannel, name: updatedName };
    this.selectedChannelSubject.next(updatedChannel);
    if (this.channel.id) {
      this.databaseService.updateDataInDB(
        'channels',
        this.channel.id,
        this.getCleanJSON(updatedName)
      );
    }
  }

  getCleanJSON(updatedName: any): {} {
    return {
      name: updatedName,
    };
  }
}
