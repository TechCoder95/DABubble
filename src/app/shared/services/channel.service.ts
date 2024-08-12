import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TextChannel } from '../interfaces/textchannel';
import { DatabaseService } from './database.service';
import { ChatService } from './chat.service';
import { UserService } from './user.service';
import { DABubbleUser } from '../interfaces/user';
import { GlobalsubService } from './globalsub.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  showSingleThread: boolean = false;

  channelSub!: Subscription;
  
  private selectedChannelSubject = new BehaviorSubject<TextChannel | null>(null);
  private createdChannel = new BehaviorSubject<TextChannel | null>(null);

  selectedChannel$ = this.selectedChannelSubject.asObservable();
  createdChannel$ = this.createdChannel.asObservable();

  channel!: TextChannel;

  constructor(private databaseService: DatabaseService, private chatService: ChatService, private userService: UserService, private subService: GlobalsubService) { }


  /**
   * Selects a channel.
   *
   * @param channel - The channel to be selected.
   */
  selectChannel(channel: TextChannel) {
    this.selectedChannelSubject.next(channel);
    this.channel = channel;
    sessionStorage.setItem('selectedChannelId', channel.id);
    this.databaseService.subscribeToChannelData(channel.id);
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

  async createDirectChannelIfNotExists(user: DABubbleUser): Promise<TextChannel> {
    const currentUser = this.userService.activeUser;

    let userChannels = await this.databaseService.getUserChannels(currentUser.id!);
    let existingChannel = userChannels.find(channel => channel.isPrivate &&
      channel.assignedUser.includes(currentUser.id!) &&
      channel.assignedUser.includes(user.id!));

    if (!existingChannel) {
      let newChannel: TextChannel = {
        id: '',
        name: user.username!,
        assignedUser: [currentUser.id!, user.id!],
        isPrivate: true,
        description: '',
        owner: currentUser.id!
      };
      const newChannelId = await this.databaseService.addChannelDataToDB('channels', newChannel);
      newChannel.id = newChannelId;
      existingChannel = newChannel;
       this.subService.updateCreatedChannel(existingChannel as TextChannel);
    }
    this.selectChannel(existingChannel);
    return existingChannel;
  }
}
