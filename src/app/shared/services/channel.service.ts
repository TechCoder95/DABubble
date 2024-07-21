import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TextChannel } from '../interfaces/textchannel';
import { DatabaseService } from './database.service';

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

  /**
   * Selects a channel.
   * 
   * @param channel - The channel to be selected.
   */
  selectChannel(channel: TextChannel) {
    this.selectedChannelSubject.next(channel);
    this.channel = channel;
  }

  /**
   * Updates the name of the selected channel.
   * 
   * @param updatedName - The updated name for the channel.
   */
  async updateChannelName(updatedName: any) {
    debugger;
    const currentChannel = this.selectedChannelSubject.value;
    const updatedChannel = { ...currentChannel, name: updatedName };
    this.selectedChannelSubject.next(updatedChannel.name);
    if (this.channel.id) {
      this.databaseService.updateDataInDB(
        'channels',
        this.channel.id,
        this.getCleanJSON(updatedName)
      );
    }
  }

  /**
   * Returns a clean JSON object with the provided updated name.
   * @param updatedName - The updated name to be included in the JSON object.
   * @returns A clean JSON object with the updated name.
   */
  getCleanJSON(updatedName: string): {} {
    return {
      name: updatedName,
    };
  }
}
