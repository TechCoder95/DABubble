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
  private selectedChannelSubject = new BehaviorSubject<TextChannel | null>(
    null,
  );
  selectedChannel$ = this.selectedChannelSubject.asObservable();

  channel!: TextChannel;
  showSingleThread: boolean = false;
  channels!: TextChannel[];
  loading: boolean = false;

  /**
   * @constructor
   * @param {DatabaseService} databaseService - Service for interacting with the database.
   * @param {UserService} userService - Service for managing user data.
   * @param {GlobalsubService} subService - Service for managing global subscriptions.
   */
  constructor(
    private databaseService: DatabaseService,
    private userService: UserService,
    private subService: GlobalsubService,
  ) {
    this.channel = JSON.parse(
      sessionStorage.getItem('selectedChannel') || '{}',
    );
    this.subService.updateActiveChannel(this.channel);
  }

  /**
   * Selects a channel and updates the selected channel observable.
   *
   * @param {TextChannel} channel - The channel to be selected.
   */
  selectChannel(channel: TextChannel) {
    this.selectedChannelSubject.next(channel);
    this.channel = channel;
    sessionStorage.setItem('selectedChannel', JSON.stringify(channel));
  }

  /**
   * Gets the currently selected channel.
   *
   * @returns {TextChannel | null} The currently selected channel.
   */
  getSelectedChannel(): TextChannel | null {
    return this.channel;
  }

  /**
   * Updates the name of the currently selected channel.
   *
   * @param {string} updatedName - The new name for the channel.
   */
  async updateChannelName(updatedName: string) {
    const currentChannel = JSON.parse(
      sessionStorage.getItem('selectedChannel') || '{}',
    );
    const updatedChannel = { ...currentChannel, name: updatedName };
    this.selectedChannelSubject.next(updatedChannel as TextChannel);
    if (this.channel.id) {
      await this.databaseService.updateDataInDB(
        'channels',
        this.channel.id,
        this.getAsJSON({ name: updatedName }),
      );
    }
  }

  /**
   * Fetches a channel by its ID.
   *
   * @param {string} channelId - The ID of the channel to fetch.
   * @returns {Promise<TextChannel>} The channel with the specified ID.
   */
  async getChannelById(channelId: string) {
    return await this.databaseService.readDataByID('channels', channelId);
  }

  /**
   * Updates a channel's data in the database.
   *
   * @param {TextChannel} channel - The channel to update.
   */
  async updateChannel(channel: TextChannel) {
    await this.databaseService.updateDataInDB('channels', channel.id, channel);
    sessionStorage.setItem('selectedChannel', JSON.stringify(channel));
    this.subService.updateActiveChannel(channel);
  }

  /**
   * Updates the description of the currently selected channel.
   *
   * @param {string} updatedDescription - The new description for the channel.
   */
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
        this.getAsJSON({ description: updatedDescription }),
      );
    }
  }

  /**
   * Converts the provided updates object into a JSON-compatible format.
   *
   * @param {Object} updates - The updates to be converted to JSON format. This should be an object where keys are strings and values can be any type.
   * @returns {Object} A JSON-compatible object representing the updates.
   */
  getAsJSON(updates: { [key: string]: any }): {} {
    return updates;
  }

  /**
   * Creates a direct channel for the current user if it doesn't already exist.
   *
   * @param {DABubbleUser} currentUser - The current user.
   * @param {TextChannel[]} channels - List of existing channels.
   * @returns {Promise<TextChannel>} The existing or newly created direct channel.
   */
  async createOwnDirectChannel(
    currentUser: DABubbleUser,
    channels: TextChannel[],
  ): Promise<TextChannel> {
    let directChannelExists = channels.find((channel: TextChannel) => {
      return (
        channel.isPrivate &&
        channel.assignedUser.length === 1 &&
        channel.assignedUser.includes(currentUser.id!)
      );
    });

    if (!directChannelExists) {
      const ownDirectChannel: TextChannel = {
        id: '',
        name: `${currentUser.username} (Du)`,
        assignedUser: [currentUser.id!],
        isPrivate: true,
        description: '',
        owner: currentUser.id!,
      };
      const newChannelId = await this.databaseService.addChannelDataToDB(
        'channels',
        ownDirectChannel,
      );
      ownDirectChannel.id = newChannelId;
      directChannelExists = ownDirectChannel;
    }

    return directChannelExists;
  }

  /**
   * Creates a direct channel between the current user and another user.
   *
   * @param {DABubbleUser} user - The user to create a direct channel with.
   * @returns {Promise<TextChannel>} The existing or newly created direct channel.
   */
  async createDirectChannel(user: DABubbleUser): Promise<TextChannel> {
    const currentUser = this.userService.activeUser;
    let userIDs = await this.databaseService.readDataByField(
      'channels',
      'assignedUser',
      currentUser.id!,
    );
    let userChannels: TextChannel[] = [];
    for (let i = 0; i < userIDs.length; i++) {
      let channel = await this.databaseService.readDataByID(
        'channels',
        userIDs[i],
      );
      userChannels.push(channel as TextChannel);
    }
    let existingChannel = userChannels.find(
      (channel) =>
        channel.isPrivate &&
        channel.assignedUser.includes(currentUser.id!) &&
        channel.assignedUser.includes(user.id!),
    );
    if (!existingChannel) {
      let newChannel: TextChannel = {
        id: '',
        name: user.username!,
        assignedUser: [currentUser.id!, user.id!],
        isPrivate: true,
        description: '',
        owner: currentUser.id!,
      };
      const newChannelId = await this.databaseService.addChannelDataToDB(
        'channels',
        newChannel,
      );
      newChannel.id = newChannelId;
      existingChannel = newChannel;
      this.subService.updateCreatedChannel(existingChannel);
    }
    this.selectChannel(existingChannel);
    return existingChannel;
  }

  /**
   * Creates a new group channel.
   *
   * @param {TextChannel} channel - The channel to be created.
   * @returns {Promise<TextChannel | null>} The newly created group channel or null if not created.
   */
  async createGroupChannel(channel: TextChannel): Promise<TextChannel | null> {
    const currentUser = this.userService.activeUser;
    const newChannel: TextChannel = {
      ...channel,
      description: channel.description,
      assignedUser: channel.assignedUser,
      isPrivate: false,
      owner: currentUser.id!,
    };

    const newChannelId = await this.databaseService.addChannelDataToDB(
      'channels',
      newChannel,
    );
    newChannel.id = newChannelId;
    return newChannel;
  }

  /**
   * Checks if a channel name already exists, excluding a specific channel by ID.
   *
   * @param {string} channelName - The channel name to check.
   * @param {string} [excludeChannelId] - The ID of a channel to exclude from the check.
   * @returns {Promise<boolean>} True if the channel name exists, false otherwise.
   */
  async doesChannelNameAlreadyExist(
    channelName: string,
    excludeChannelId?: string,
  ): Promise<boolean> {
    const lowerCaseName = channelName.toLowerCase();
    const channels =
      await this.databaseService.readDataFromDB<TextChannel>('channels');
    return channels.some((channel: TextChannel) => {
      if (channel && channel != null && channel.name != undefined) {
        return (
          channel.name.toLocaleLowerCase() === lowerCaseName &&
          channel.id !== excludeChannelId
        );
      }
      return null;
    });
  }

  /**
   * Compares two arrays for equality.
   *
   * @param {any[]} arr1 - The first array.
   * @param {any[]} arr2 - The second array.
   * @returns {boolean} True if the arrays are equal, false otherwise.
   */
  arrayEquals(arr1: any[], arr2: any[]): boolean {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;

    // Sortiere die Arrays vor dem Vergleich
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();

    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  }

  /**
   * Creates the default group channels for the user.
   *
   * @param {DABubbleUser} activeUser - The active user for whom the default channels are created.
   * @returns {Promise<TextChannel[]>} The list of default group channels.
   */
  async createDefaultGroupChannels(
    activeUser: DABubbleUser,
  ): Promise<TextChannel[]> {
    const users =
      (await this.userService.getAllUsersFromDB()) as DABubbleUser[];
    const allUserIds = users.map((user) => user!.id!);

    if (!allUserIds.includes(activeUser.id!)) {
      allUserIds.push(activeUser.id!);
    }

    const updatedChannels: TextChannel[] = [];
    const defaultChannels = [
      { name: 'Allgemein', description: 'Hier werden alle Benutzer geladen.' },
      {
        name: 'Entwicklerteam',
        description: 'Ein super tolles Entwicklerteam',
      },
    ];

    for (const defaultChannel of defaultChannels) {
      const channelUid = `group-${defaultChannel.name.toLowerCase()}`;
      let existingChannel = await this.getChannelByUid(channelUid);
      if (existingChannel) {
        const updatedAssignedUsers = [
          ...new Set([...existingChannel.assignedUser, ...allUserIds]),
        ];
        if (
          updatedAssignedUsers.length !== existingChannel.assignedUser.length
        ) {
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

        const newChannelId = await this.databaseService.addChannelDataToDB(
          'channels',
          newChannel,
        );
        newChannel.id = newChannelId;
        existingChannel = newChannel;
      }

      updatedChannels.push(existingChannel);
    }

    return updatedChannels;
  }

  /**
   * Creates the default direct channels between the active user and a list of users.
   *
   * @param {DABubbleUser[]} defaultUsers - The list of users to create direct channels with.
   * @param {DABubbleUser} activeUser - The active user.
   * @returns {Promise<TextChannel[]>} The list of created direct channels.
   */
  async createDefaultDirectChannels(
    defaultUsers: DABubbleUser[],
    activeUser: DABubbleUser,
  ): Promise<TextChannel[]> {
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

        const newChannelId = await this.databaseService.addChannelDataToDB(
          'channels',
          newChannel,
        );
        newChannel.id = newChannelId;
        existingChannel = newChannel;
      }

      directChannels.push(existingChannel);
    }

    return directChannels;
  }

  /**
   * Fetches a channel by its unique identifier (UID).
   *
   * @param {string} uid - The unique identifier of the channel.
   * @returns {Promise<TextChannel | undefined>} The channel with the specified UID, or undefined if not found.
   */
  async getChannelByUid(uid: string): Promise<TextChannel | undefined> {
    const channels = await this.databaseService.readDataByField(
      'channels',
      'uid',
      uid,
    );
    return channels.length > 0 ? channels[0] : undefined;
  }

  /**
   * Retrieves all channels from the database.
   *
   * @returns {Promise<TextChannel[]>} A promise that resolves to the list of all channels.
   */
  async getAllChannels(): Promise<TextChannel[]> {
    return await this.databaseService.readDataFromDB<TextChannel>('channels');
  }

  /**
   * Finds or creates a direct channel between the current user and a selected user.
   *
   * @returns {Promise<TextChannel | null>} The found or newly created direct channel, or null if not found.
   */
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
          owner: this.userService.activeUser.id!,
        };

        const allChannels = await this.getAllChannels();
        const existingChannel = allChannels.find(
          (channel) =>
            this.arrayEquals(channel.assignedUser, textChannel.assignedUser) &&
            channel.isPrivate,
        );

        if (existingChannel) {
          return existingChannel;
        } else {
          return await this.createDirectChannel(selectedUser);
        }
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Removes the current user from the selected channel, and deletes the channel if it becomes empty.
   */
  async leaveChannel() {
    const currentUser: DABubbleUser = this.userService.activeUser;
    const channel: TextChannel = JSON.parse(
      sessionStorage.getItem('selectedChannel')!
    );
    const assignedUsersWithoutCurrentUser: string[] =
      this.channel.assignedUser.filter((id) => id !== currentUser.id);

    if (assignedUsersWithoutCurrentUser.length > 0) {
      await this.databaseService.updateDataInDB('channels', channel!.id, {
        assignedUser: assignedUsersWithoutCurrentUser,
      });
    } else {
      await this.databaseService.deleteDataFromDB('channels', channel!.id);
    }

    let channels = JSON.parse(sessionStorage.getItem('channels')!);
    channels = channels.filter((ch: any) => ch.id !== channel.id);
    sessionStorage.setItem('channels', JSON.stringify(channels));

    this.selectedChannelSubject.next(null);
    sessionStorage.removeItem('selectedChannel');
  }

  /**
   * Initializes default data, including creating default channels and loading user channels.
   */
  async initializeDefaultData() {
    this.loading = true;
    await this.createDefaultData();
    this.channels = await this.userService.getUserChannels(
      this.userService.activeUser.id!,
    );
    sessionStorage.setItem('channels', JSON.stringify(this.channels));
  }

  /**
   * Creates default data, including users and channels.
   */
  async createDefaultData() {
    const defaultUsers = await this.userService.createDefaultUsers();
    await this.createDefaultGroupChannels(this.userService.activeUser);
    await this.createDefaultDirectChannels(
      defaultUsers,
      this.userService.activeUser,
    );
    this.loading = false;
  }

  /**
   * Searches for channels by name and filters them by the active user's ID.
   *
   * @param {string} searchText - The text to search for in channel names.
   * @param {string} activeUserId - The ID of the active user.
   * @returns {Promise<TextChannel[]>} The list of channels that match the search criteria.
   */
  async searchChannelsByName(
    searchText: string,
    activeUserId: string,
  ): Promise<TextChannel[]> {
    return await this.databaseService
      .getChannelsByName(searchText)
      .then((channels) => {
        return channels.filter((channel) =>
          channel.assignedUser.includes(activeUserId),
        );
      });
  }
}
