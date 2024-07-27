import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TextChannel } from '../interfaces/textchannel';
import { DatabaseService } from './database.service';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private selectedChannelSubject = new BehaviorSubject<TextChannel | null>(
    null
  );

  constructor(private databaseService: DatabaseService, private chatService: ChatService) {}

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
    console.log(this.channel);
    this.getActiveMessages(this.channel);
  }

  getActiveMessages(channel: TextChannel) {
    this.databaseService.subscribeToMessages(channel)
  }

  /**
   * Updates the name of the selected channel.
   *
   * @param updatedName - The updated name for the channel.
   */
  async updateChannelName(updatedName: string) {
    const currentChannel = this.selectedChannelSubject.value;
    const updatedChannel = { ...currentChannel, name: updatedName };
    this.selectedChannelSubject.next(updatedChannel as TextChannel);
    if (this.channel.id) {
      await this.databaseService.updateDataInDB(
        'channels',
        this.channel.id,
        this.getCleanJSON({ name: updatedName })
      );
    }
  }

  async updateChannel(channel: TextChannel) {
    const cleanChannel = this.cleanData(channel);
    if (cleanChannel.id) {
      await this.databaseService.updateDataInDB('channels', cleanChannel.id, cleanChannel);
    }
  }

  private cleanData(channel: TextChannel): Partial<TextChannel> {
    const cleanChannel: Partial<TextChannel> = {};
    Object.keys(channel).forEach(key => {
      const value = (channel as any)[key];
      if (value !== undefined) {
        (cleanChannel as any)[key] = value;
      }
    });
    return cleanChannel;
  }

  async updateChannelDescription(updatedDescription: any) {
    const currentChannel = this.selectedChannelSubject.value;
    const updatedChannel = {
      ...currentChannel,
      description: updatedDescription,
    };
    this.selectedChannelSubject.next(updatedChannel as TextChannel);
    if (this.channel.id) {
      await this.databaseService.updateDataInDB(
        'channels',
        this.channel.id,
        this.getCleanJSON({ description: updatedDescription })
      );
    }
  }

  getCleanJSON(updates: { [key: string]: any }): {} {
    return updates;
  }
}
