import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TextChannel } from '../interfaces/textchannel';
import { DatabaseService } from './database.service';
import { ChatService } from './chat.service';
import { UserService } from './user.service';
import { DABubbleUser } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private selectedChannelSubject = new BehaviorSubject<TextChannel | null>(null);
  private createdChannel = new BehaviorSubject<TextChannel | null>(null);

  selectedChannel$ = this.selectedChannelSubject.asObservable();
  createdChannel$ = this.createdChannel.asObservable();

  channel!: TextChannel;

  constructor(private databaseService: DatabaseService, private chatService: ChatService, private userService: UserService) { }


  /**
   * Selects a channel.
   *
   * @param channel - The channel to be selected.
   */
  selectChannel(channel: TextChannel) {
    this.selectedChannelSubject.next(channel);
    this.channel = channel;
    // console.log(this.channel);
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

  async createDirectChannelIfNotExists(addedUser: DABubbleUser): Promise<TextChannel> {
    const currentUser = this.userService.activeUser;
    const userChannels = await this.databaseService.getUserChannels(addedUser.id!);
    let existingChannel = userChannels.find(channel => channel.isPrivate && channel.assignedUser.includes(addedUser.id!));
    console.log("Aktueller Nutzer: ", currentUser);
    console.log("Hinzugefügter Nutzer: ", addedUser);

    if (!existingChannel) {
      let newChannel: TextChannel = {
        id: '',
        name: addedUser.username!,
        assignedUser: [currentUser.id!, addedUser.id!],
        isPrivate: true,
        description: '',
        conversationId: [],
        owner: currentUser.id!
      };
      const newChannelId = await this.databaseService.addChannelDataToDB('channels', newChannel);
      newChannel.id = newChannelId;
      existingChannel = newChannel;
      this.createdChannel.next(existingChannel);
    }

    return existingChannel;
  }
}
