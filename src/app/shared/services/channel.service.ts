import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TextChannel } from '../interfaces/textchannel';
import { DatabaseService } from './database.service';
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
  public channels!: TextChannel[];


  loading: boolean = false;

  constructor(private databaseService: DatabaseService, private userService: UserService, private subService: GlobalsubService) {

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

  getSelectedChannel(): TextChannel | null {
    return this.channel;
  }

  /**
   * Updates the name of the selected channel.
   *
   * @param updatedName - The updated name for the channel.
   */
  async updateChannelName(updatedName: string) {
    const currentChannel = JSON.parse(sessionStorage.getItem("selectedChannel") || '{}');
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

  async createGroupChannel(channel: TextChannel): Promise<TextChannel | null> {
    const currentUser = this.userService.activeUser;
    const newChannel: TextChannel = {
      ...channel,
      assignedUser: [this.userService.activeUser.id!],
      isPrivate: false,
      owner: currentUser.id!
    };

    const newChannelId = await this.databaseService.addChannelDataToDB('channels', newChannel);
    newChannel.id = newChannelId;
    return newChannel;
  }


  async doesChannelNameAlreadyExist(channelName: string, excludeChannelId?: string): Promise<boolean> {
    const lowerCaseName = channelName.toLowerCase();
    const channels = await this.databaseService.readDataFromDB<TextChannel>('channels');
    return channels.some((channel: TextChannel) => {
      if (channel && (channel != null) && (channel.name != undefined)) {
        return channel.name.toLocaleLowerCase() === lowerCaseName && channel.id !== excludeChannelId
      }
      return null;
    });
  }

  arrayEquals(arr1: any[], arr2: any[]): boolean {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
  }


  async createDefaultGroupChannels(activeUser: DABubbleUser): Promise<TextChannel[]> {
    const users = await this.userService.getAllUsersFromDB() as DABubbleUser[];
    const allUserIds = users.map(user => user!.id!);
  
    if (!allUserIds.includes(activeUser.id!)) {
      allUserIds.push(activeUser.id!);
    }
  
    const updatedChannels: TextChannel[] = [];
    const defaultChannels = [
      { name: 'Allgemein', description: 'Hier werden alle Benutzer geladen.' },
      { name: 'Entwicklerteam', description: 'Ein super tolles Entwicklerteam' }
    ];
  
    for (const defaultChannel of defaultChannels) {
      const channelUid = `group-${defaultChannel.name.toLowerCase()}`;
      let existingChannel = await this.getChannelByUid(channelUid);
      if (existingChannel) {
        const updatedAssignedUsers = [...new Set([...existingChannel.assignedUser, ...allUserIds])];
        if (updatedAssignedUsers.length !== existingChannel.assignedUser.length) {
          existingChannel.assignedUser = updatedAssignedUsers;
          await this.updateChannel(existingChannel);
        }
      } else {
        const newChannel: TextChannel = {
          id: '',
          uid: channelUid,
          name: defaultChannel.name,
          assignedUser: [...allUserIds],
          isPrivate: false,
          description: defaultChannel.description,
          owner: activeUser.id!,
        };
  
        const newChannelId = await this.databaseService.addChannelDataToDB('channels', newChannel);
        newChannel.id = newChannelId;
        existingChannel = newChannel;
      }
  
      updatedChannels.push(existingChannel);
    }
    
    return updatedChannels;
  }

  async createDefaultDirectChannels(defaultUsers: DABubbleUser[], activeUser: DABubbleUser): Promise<TextChannel[]> {
    const directChannels: TextChannel[] = [];

    for (const user of defaultUsers) {
      const channelUid = `${activeUser.id!}-${user.id!}`; 

      let existingChannel = await this.getChannelByUid(channelUid);

      if (!existingChannel) {
        const newChannel: TextChannel = {
          id: '',
          uid: channelUid,
          name: user.username,
          assignedUser: [activeUser.id!, user.id!],
          isPrivate: true,
          description: '',
          owner: activeUser.id!,
        };

        const newChannelId = await this.databaseService.addChannelDataToDB('channels', newChannel);
        newChannel.id = newChannelId;
        existingChannel = newChannel;
      }

      directChannels.push(existingChannel);
    }

    return directChannels;
  }

  async getChannelByUid(uid: string): Promise<TextChannel | undefined> {
    const channels = await this.databaseService.readDataByField('channels', 'uid', uid);
    return channels.length > 0 ? channels[0] : undefined;
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
          const allChannels = await this.getAllChannels();
          return allChannels.find(channel => this.arrayEquals(channel.assignedUser, textChannel.assignedUser))!;
        } else {
          return await this.createDirectChannel(selectedUser);
        }
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  async leaveChannel() {
    const currentUser: DABubbleUser = this.userService.activeUser;
    const channel: TextChannel = JSON.parse(sessionStorage.getItem("selectedChannel") || '{}');
    const assignedUsersWithoutCurrentUser: string[] = this.channel.assignedUser.filter(id => id !== currentUser.id);

    if (assignedUsersWithoutCurrentUser.length > 0) {
      await this.databaseService.updateDataInDB('channels', channel!.id, { assignedUser: assignedUsersWithoutCurrentUser });
    } else {
      await this.databaseService.deleteDataFromDB('channels', channel!.id);
    }

    let channels = JSON.parse(sessionStorage.getItem('channels')!);
    channels = channels.filter((ch: any) => ch.id !== channel.id);
    sessionStorage.setItem('channels', JSON.stringify(channels));

    this.selectedChannelSubject.next(null);
    sessionStorage.removeItem('selectedChannel');
  }

  async initializeSidenavData() {
    this.loading = true;
    await this.createDefaultData();
    this.channels = await this.userService.getUserChannels(this.userService.activeUser.id!);
    sessionStorage.setItem('channels', JSON.stringify(this.channels));
  }

  async createDefaultData() {
    const defaultUsers = await this.userService.createDefaultUsers();
    await this.createDefaultGroupChannels(this.userService.activeUser);
     await this.createDefaultDirectChannels(defaultUsers, this.userService.activeUser);
    this.loading = false;
  }

  async searchChannelsByName(searchText: string, activeUserId: string): Promise<TextChannel[]> {
    return await this.databaseService.getChannelsByName(searchText).then(channels => {
      return channels.filter(channel => channel.assignedUser.includes(activeUserId));
    });
  }

}


