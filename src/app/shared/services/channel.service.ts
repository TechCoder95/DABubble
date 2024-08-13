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

  channelSub!: Subscription;
  private selectedChannelSubject = new BehaviorSubject<TextChannel | null>(null);
  selectedChannel$ = this.selectedChannelSubject.asObservable();

  channel!: TextChannel;
  showSingleThread: boolean = false;

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

  async createDirectChannel(user: DABubbleUser): Promise<TextChannel> {
    const currentUser = this.userService.activeUser;
    let userIDs = await this.databaseService.readDataByField('channels', 'assignedUser', currentUser.id!)
    let userChannels: TextChannel[] = [];
    for (let i = 0; i < userIDs.length; i++) {
      let channel = await this.databaseService.readDataByID('channels', userIDs[i]);
      userChannels.push(channel as TextChannel);
    }
    let existingChannel = userChannels.find(channel => channel.isPrivate && channel.assignedUser.includes(currentUser.id!) && channel.assignedUser.includes(user.id!));
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
      this.subService.updateCreatedChannel(existingChannel);
    }
    this.selectChannel(existingChannel);
    return existingChannel;
  }


  async createGroupChannel(data: TextChannel) {
    const currentUser = this.userService.activeUser;
    const newChannel: TextChannel = {
      ...data,
      assignedUser: [this.userService.activeUser.id!],
      isPrivate: false,
      owner: currentUser.id!
    };
    try {
      const newChannelId = await this.databaseService.addChannelDataToDB('channels', newChannel);
      newChannel.id = newChannelId;
      return newChannel;
    } catch (err) {
      console.error('Fehler beim Hinzufügen des neuen Kanals', err);
      return null;
    }
  }
}
