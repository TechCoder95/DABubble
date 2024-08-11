import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { DatabaseService } from '../../shared/services/database.service';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddChannelComponent } from '../add-channel/add-channel.component';
import { ChatMessage } from '../../shared/interfaces/chatmessage';
import { ChatComponent } from '../../Dimi/chat/chat.component';
import { ChannelService } from '../../shared/services/channel.service';
import { UserService } from '../../shared/services/user.service';
import { DABubbleUser } from '../../shared/interfaces/user';
import { NewChatComponent } from '../../rabia/new-chat/new-chat.component';
import { distinctUntilChanged, filter, Subscription } from 'rxjs';
import { ThreadComponent } from "../../rabia/thread/thread.component";
import { GlobalsubService } from '../../shared/services/globalsub.service';
import { User } from 'firebase/auth';

interface Node {
  id: string;
  name: string;
  type: 'groupChannel' | 'directMessage' | 'action';
  children?: Node[];
  avatar?: string;
}

interface FlattenedNode {
  expandable: boolean;
  name: string;
  id: string;
  level: number;
  type: 'groupChannel' | 'directMessage' | 'action';
  avatar?: string
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatTreeModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    ChatComponent,
    NewChatComponent,
    ThreadComponent,
    SearchbarComponent
],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy {

  private transformer = (node: Node, level: number): FlattenedNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    id: node.id,
    level: level,
    type: node.type,
    avatar: node.avatar
  });

  treeControl = new FlatTreeControl<FlattenedNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  channels: TextChannel[] = [];
  private TREE_DATA: Node[] = [];
  selectedChannel: TextChannel | null = null;
  messages: ChatMessage[] = [];
  showNewChat: boolean = false;
  isLoggedIn: boolean | undefined;
  isCurrentUserActivated: boolean | undefined;


  private createdChannelSubscription!: Subscription;
  private userSubscription!: Subscription;

  constructor(
    private dbService: DatabaseService,
    private dialog: MatDialog,
    public channelService: ChannelService,
    private userService: UserService,
    private subService: GlobalsubService
  ) { }

  @Input() activeUserChange!: any;
  @Input() activeGoogleUserChange!: any;
  @Input() activeChannelChange!: any;
  @Input() allMessagesChange!: any;

  activeUser!: DABubbleUser;
  activeGoogleUser!: User;
  activeChannel!: TextChannel;


  ngOnInit() {
    // this.subService.getGoogleUserObservable().subscribe(googleUser => {
    //   if (googleUser) {
    //     this.isCurrentUserActivated = googleUser.emailVerified;
    //   }

    // Das durch einen Input ersetzen
    // });


    this.activeUserChange.subscribe((user: DABubbleUser) => {
      this.activeUser = user;
      this.isLoggedIn = this.activeUser?.isLoggedIn;
      if (this.activeUser) {
        this.loadUserChannels(this.activeUser).then(() => {
          this.initializeDirectMessageForUser(this.activeUser).then(() => {
            this.updateTreeData().then(() => {
              this.loadLastChannelState();
            }
            );
          });
        });
      }

      // await this.initializeDefaultData();

      this.createdChannelSubscription = this.channelService.createdChannel$.subscribe((channel) => {
        // console.log('sidenav channelsub zeile 122');
        if (channel) {
          this.channels.push(channel);
          this.updateTreeData();
        }
      });
    });


  }


  // todo
  private async initializeDefaultData() {
    const defaultGroupChannels: TextChannel[] = [
      { id: 'groupChannel1', name: 'Allgemein', assignedUser: [], isPrivate: false, description: 'Allgemeiner Channel', conversationId: [], owner: '' },
      { id: 'groupChannel2', name: 'Entwicklerteam', assignedUser: [], isPrivate: false, description: 'Entwickler Channel', conversationId: [], owner: '' }
    ];

    const defaultUsers: DABubbleUser[] = [
      { id: '', username: 'User1', mail: 'user1@example.com', isLoggedIn: true, avatar: './img/5.svg', uid: 'uid-user1' },
      { id: '', username: 'User2', mail: 'user2@example.com', isLoggedIn: true, avatar: './img/2.svg', uid: 'uid-user2' },
      { id: '', username: 'User3', mail: 'user4@example.com', isLoggedIn: true, avatar: './img/4.svg', uid: 'uid-user3' }
    ];

    const defaultDirectChannels: TextChannel[] = [
      { id: 'directChannel1', name: 'Direktnachricht 1', assignedUser: [], isPrivate: true, description: '', conversationId: [], owner: '' },
      { id: 'directChannel2', name: 'Direktnachricht 2', assignedUser: [], isPrivate: true, description: '', conversationId: [], owner: '' }
    ];

    // Überprüfe, ob Standardbenutzer vorhanden sind
    let standardUsersExist = true;
    for (const user of defaultUsers) {
      const existingUser = await this.userService.getDefaultUserByUid(user.uid!);
      if (!existingUser) {
        standardUsersExist = false;
        break;
      }
    }

    // Füge Standardbenutzer hinzu, wenn sie nicht vorhanden sind
    if (!standardUsersExist) {
      for (const user of defaultUsers) {
        await this.userService.addDefaultUserToDatabase(user);
      }
    }

    // Füge Standard-Gruppenkanäle hinzu
    for (const groupChannel of defaultGroupChannels) {
      const existingGroupChannel = this.channels.find(channel => channel.name === groupChannel.name && !channel.isPrivate);
      if (!existingGroupChannel) {
        // todo   
        const newChannelId = await this.dbService.addChannelDataToDB('channels', groupChannel);
        groupChannel.id = newChannelId;
        this.channels.push(groupChannel);
      }
    }

    // Füge Standard-Direktnachrichten hinzu
    for (const directChannel of defaultDirectChannels) {
      const existingDirectChannel = this.channels.find(channel => channel.name === directChannel.name && channel.isPrivate);
      if (!existingDirectChannel) {
        // todo  
        const newChannelId = await this.dbService.addChannelDataToDB('channels', directChannel);
        directChannel.id = newChannelId;
        this.channels.push(directChannel);
      }
    }

    await this.updateTreeData();
  }


  async loadLastChannelState() {
    const savedChannelId = sessionStorage.getItem('selectedChannelId');
    if (savedChannelId) {
      const selectedChannel = this.channels.find(channel => channel.id === savedChannelId);
      if (selectedChannel) {
        this.selectedChannel = selectedChannel;
        this.channelService.selectChannel(selectedChannel);
      }
    }
  }


  async ngOnDestroy() {
    if (this.userSubscription)
    this.userSubscription.unsubscribe();

    if (this.createdChannelSubscription)
    this.createdChannelSubscription.unsubscribe();
  }


  private async loadUserChannels(currentUser: DABubbleUser) {
    this.channels = await this.userService.getUserChannels(currentUser.id!);
  }


  private async initializeDirectMessageForUser(currentUser: DABubbleUser) {
    const directMessageExists = this.channels.some(
      (channel) => channel.isPrivate && channel.assignedUser.includes(currentUser.id!)
    );

    if (!directMessageExists) {
      const directMessage: TextChannel = {
        id: '',
        name: `${currentUser.username} (Du)`,
        assignedUser: [currentUser.id!],
        isPrivate: true,
        description: '',
        conversationId: [],
        owner: ''
      };
      const newChannelId = await this.dbService.addChannelDataToDB('channels', directMessage);
      directMessage.id = newChannelId;
      this.channels.push(directMessage);
      await this.updateTreeData();
    }
  }

  hasChild = (_: number, node: FlattenedNode) => node.expandable;

  async addChannel(data: TextChannel) {
    const newChannel: TextChannel = {
      ...data,
      assignedUser: [this.userService.activeUser.id!],
      isPrivate: false
    };
    try {
      const newChannelId = await this.dbService.addChannelDataToDB(
        'channels',
        newChannel
      );
      newChannel.id = newChannelId;
      this.channels.push(newChannel);
      await this.updateTreeData();
    } catch (err) {
      console.error('Fehler beim Hinzufügen des neuen Kanals', err);
    }
  }

  private isDefined(
    channel: TextChannel
  ): channel is TextChannel & { name: string } {
    return channel.name !== undefined;
  }

  private async fetchChannels(): Promise<void> {
    this.channels = await this.userService.getUserChannels(this.userService.activeUser.id!);
  }

  createGroupChannelNodes(): Node[] {
    const nodes = this.channels
      .filter(channel => !channel.isPrivate && this.isDefined(channel))
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        type: 'groupChannel' as const,
      }));
    return nodes;
  }

  private async createOwnDirectChannelNode(currentUser: DABubbleUser): Promise<Node | null> {
    for (const channel of this.channels) {
      if (channel.isPrivate && this.isDefined(channel) && channel.assignedUser.length === 1 && channel.assignedUser[0] === currentUser.id) {
        const node: Node = {
          id: channel.id,
          name: currentUser.username + " (Du)",
          type: 'directMessage' as const,
          children: [],
          avatar: currentUser.avatar
        };
        return node;
      }
    }
    return null;
  }

  private async createOtherDirectChannelNodes(currentUser: DABubbleUser): Promise<Node[]> {
    const directMessageNodes: Node[] = [];
    for (const channel of this.channels) {
      if (channel.isPrivate && this.isDefined(channel) && !(channel.assignedUser.length === 1 && channel.assignedUser[0] === currentUser.id)) {
        const otherUserId = channel.assignedUser.find(id => id !== currentUser.id);
        if (otherUserId) {
          const user = await this.userService.getOneUserbyId(otherUserId);
          if (user) {
            const node: Node = {
              id: channel.id,
              name: user?.username + "",
              type: 'directMessage' as const,
              children: [],
              avatar: user.avatar
            };
            directMessageNodes.push(node);
          }
        }
      }
    }
    return directMessageNodes;
  }

  async createDirectMessageNodes(): Promise<Node[]> {
    const directMessageNodes: Node[] = [];
    const currentUser = this.userService.activeUser;
    const ownNode = await this.createOwnDirectChannelNode(currentUser);
    if (ownNode)
      directMessageNodes.push(ownNode);
    const otherNodes = await this.createOtherDirectChannelNodes(currentUser);
    directMessageNodes.push(...otherNodes);
    return directMessageNodes;
  }

  async updateTreeData(): Promise<void> {
    const groupChannelNodes = await this.createGroupChannelNodes();
    const directMessageNodes = await this.createDirectMessageNodes();

    const channelsStructure: Node = {
      id: 'channels',
      name: 'Channels',
      type: 'groupChannel',
      children: [
        ...groupChannelNodes,
        { id: 'add-channel', name: 'Channel hinzufügen', type: 'action' as const },
      ],
    };

    const directMessagesStructure: Node = {
      id: 'direct-messages',
      name: 'Direktnachrichten',
      type: 'directMessage',
      children: directMessageNodes,
    };

    this.TREE_DATA = [channelsStructure, directMessagesStructure];
    this.dataSource.data = this.TREE_DATA;
    this.treeControl.expandAll();
  }

  async loadChannels() {
    await this.fetchChannels();
    await this.updateTreeData();
  }

  async onNode(node: FlattenedNode) {
    if (node.expandable) {
      this.treeControl.toggle(node);
    }
    else if (this.isGroupChannel(node) || this.isDirectMessage(node)) {
      const selectedChannel = this.channels.find(
        (channel) => channel.id === node.id
      );
      if (selectedChannel) {
        this.selectedChannel = selectedChannel;
        this.channelService.selectChannel(selectedChannel);
        sessionStorage.setItem('selectedChannelId', selectedChannel.id);
        this.showNewChat = false;
      }
    } else if (node.type === 'action') {
      this.openAddChannelDialog();
    }
  }

  openAddChannelDialog(): void {
    const dialogRef = this.dialog.open(AddChannelComponent);
    dialogRef.afterClosed().subscribe((result: TextChannel) => {
      if (result) {
        this.addChannel(result);
      }
    });
  }

  isGroupChannel = (node: FlattenedNode): boolean => {
    return (
      !node.expandable &&
      node.type === 'groupChannel' &&
      node.name !== 'Channel hinzufügen'
    );
  };

  isDirectMessage(node: FlattenedNode): boolean {
    return node.type === 'directMessage';
  }

  isCategoryNode(node: FlattenedNode): boolean {
    return node.type === 'groupChannel' || node.type === 'directMessage';
  }

  isActionNode(node: FlattenedNode): boolean {
    return node.type === 'action';
  }

  isSelectedChannel(node: FlattenedNode): boolean {
    return this.selectedChannel?.id === node.id;
  }

  openNewMessage() {
    this.showNewChat = true;
  }
}
