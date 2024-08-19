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

  constructor(private databaseService: DatabaseService, private chatService: ChatService, private userService: UserService, private subService: GlobalsubService) {

    this.channel = JSON.parse(sessionStorage.getItem('selectedChannel') || '{}');
    this.subService.updateActiveChannel(this.channel);
  }



  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }


  /**
   * Selects a channel.
   *
   * @param channel - The channel to be selected.
   */
  selectChannel(channel: TextChannel) {
    this.selectedChannelSubject.next(channel);
    this.channel = channel;
    sessionStorage.setItem('selectedChannel', JSON.stringify(channel));
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

  async getChannelById(channelId: string) {
    return await this.databaseService.readDataByID('channels', channelId);
  }

  async updateChannel(channel: TextChannel) {
    await this.databaseService.updateDataInDB('channels', channel.id, channel);
    sessionStorage.setItem('selectedChannel', JSON.stringify(channel));
    this.subService.updateActiveChannel(channel);
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

  async createOwnDirectChannel(currentUser: DABubbleUser, channels: TextChannel[]): Promise<TextChannel> {
    let directChannelExists = channels.find((channel: TextChannel) => {
      return channel.isPrivate && channel.assignedUser.length === 1 && channel.assignedUser.includes(currentUser.id!)
    });

    if (!directChannelExists) {
      const ownDirectChannel: TextChannel = {
        id: '',
        name: `${currentUser.username} (Du)`,
        assignedUser: [currentUser.id!],
        isPrivate: true,
        description: '',
        owner: currentUser.id!
      };
      const newChannelId = await this.databaseService.addChannelDataToDB('channels', ownDirectChannel);
      ownDirectChannel.id = newChannelId;
      directChannelExists = ownDirectChannel;
    }

    return directChannelExists;
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

  async createGroupChannel(data: TextChannel): Promise<TextChannel> {
    const currentUser = this.userService.activeUser;
    const newChannel: TextChannel = {
      ...data,
      assignedUser: [this.userService.activeUser.id!],
      isPrivate: false,
      owner: currentUser.id!
    };
    const newChannelId = await this.databaseService.addChannelDataToDB('channels', newChannel);
    newChannel.id = newChannelId;
    return newChannel;
  }

  async findExistingChannelInDB(channel: TextChannel): Promise<TextChannel | undefined> {
    const channels = await this.databaseService.readDataByField('channels', 'name', channel.name);
    return channels.find((dbChannel: TextChannel) =>
      dbChannel.name === channel.name &&
      dbChannel.isPrivate === channel.isPrivate &&
      this.arrayEquals(dbChannel.assignedUser, channel.assignedUser)
    );
  }

  private arrayEquals(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((value, index) => value === sortedB[index]);
  }

  createDefaultGroupChannels(userIdMap: { [key: string]: string }, activeUser: DABubbleUser): TextChannel[] {
    return [
      { id: '', name: 'Allgemein', assignedUser: [activeUser.id!, ...Object.values(userIdMap)], isPrivate: false, description: 'Hier werden alle Benutzer geladen.', owner: activeUser.id! },
      { id: '', name: 'Entwicklerteam', assignedUser: [activeUser.id!, ...Object.values(userIdMap)], isPrivate: false, description: 'Ein super tolles Entwicklerteam', owner: activeUser.id! }
    ];
  }

  createDefaultDirectChannels(userIdMap: { [key: string]: string }, activeUser: DABubbleUser): TextChannel[] {
    return [
      { id: '', name: 'Felix', assignedUser: [activeUser.id!, userIdMap['Felix']], isPrivate: true, description: '', owner: activeUser.id! },
      { id: '', name: 'Jimmy', assignedUser: [activeUser.id!, userIdMap['Jimmy']], isPrivate: true, description: '', owner: activeUser.id! },
      { id: '', name: 'Mia', assignedUser: [activeUser.id!, userIdMap['Mia']], isPrivate: true, description: '', owner: activeUser.id! }
    ];
  }

  async addOrUpdateDefaultChannels(channels: TextChannel[]): Promise<TextChannel[]> {
    const updatedChannels: TextChannel[] = [];
    for (const channel of channels) {
      const existingChannel = await this.findExistingChannelInDB(channel);
      if (!existingChannel) {
        const newChannelId = await this.databaseService.addChannelDataToDB('channels', channel);
        channel.id = newChannelId;
        updatedChannels.push(channel);
      } else {
        updatedChannels.push(existingChannel);
      }
    }

    return updatedChannels;
  }

  async getAllChannels(): Promise<TextChannel[]> {
    return await this.databaseService.readDataFromDB<TextChannel>('channels');
  }

  async isChannelAlreadyExists(channel: TextChannel): Promise<boolean> {
    const allChannels = await this.getAllChannels();
    return allChannels.some((existingChannel: TextChannel) =>
      this.arrayEquals(existingChannel.assignedUser, channel.assignedUser)
    );
  }

  async findOrCreateChannelByUserID(): Promise<TextChannel | null> {
    try {
      const selectedUser = this.userService.getSelectedUser();
      if (selectedUser) {
        const textChannel: TextChannel = {
          id: '',
          name: '',
          assignedUser: [this.userService.activeUser.id!, selectedUser.id!],
          isPrivate: true,
          description: '',
          owner: this.userService.activeUser.id!
        };

        const channelExists = await this.isChannelAlreadyExists(textChannel);

        if (channelExists) {
          console.log("channel existiert bereits");

          const allChannels = await this.getAllChannels();
          return allChannels.find(channel => this.arrayEquals(channel.assignedUser, textChannel.assignedUser))!;
        } else {
          return await this.createDirectChannel(selectedUser);
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}




