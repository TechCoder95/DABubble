import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input, ViewChild, AfterViewInit } from '@angular/core';
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
import { Subscription, take } from 'rxjs';
import { ThreadComponent } from "../../rabia/thread/thread.component";
import { GlobalsubService } from '../../shared/services/globalsub.service';
import { User } from 'firebase/auth';
import { InputfieldComponent } from '../../Dimi/chat/chat-inputfield/inputfield.component';

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
    ThreadComponent
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

  treeControl = new FlatTreeControl<FlattenedNode>((node) => node.level, (node) => node.expandable);
  treeFlattener = new MatTreeFlattener(this.transformer, (node) => node.level, (node) => node.expandable, (node) => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  channels: TextChannel[] = [];
  private TREE_DATA: Node[] = [];
  selectedChannel: TextChannel | null = null;
  messages: ChatMessage[] = [];
  showNewChat: boolean = false;
  isLoggedIn: boolean | undefined;
  isCurrentUserActivated: boolean | undefined;

  @Input() activeUserChange!: any;
  @Input() activeGoogleUserChange!: any;
  @Input() activeChannelChange!: any;
  @Input() allMessagesChange!: any;

  activeUser!: DABubbleUser;
  activeGoogleUser!: User;
  activeChannel!: TextChannel;

  private createdChannelSubscription!: Subscription;
  private userSubscription!: Subscription;

  constructor(private dbService: DatabaseService, private dialog: MatDialog, public channelService: ChannelService, private userService: UserService, private subService: GlobalsubService) {
  }




  async ngOnDestroy() {
    if (this.userSubscription)
      this.userSubscription.unsubscribe();

    if (this.createdChannelSubscription)
      this.createdChannelSubscription.unsubscribe();
  }

  async ngOnInit() {
    // await this.initializeDefaultData();

    this.activeUserChange.pipe(take(1)).subscribe(async (user: DABubbleUser) => {
      this.activeUser = user;
      this.isLoggedIn = this.activeUser?.isLoggedIn;
      if (this.activeUser) {
        await this.loadUserChannels(this.activeUser)
        await this.initializeDirectMessageForUser(this.activeUser)
        await this.updateTreeData()
        await this.loadLastChannelState();
      }

      // vorest eine lösung
      //console.log("wird nur noch einmal ausgeführt, durch take(1)");

      this.createdChannelSubscription = this.subService.getChannelCreatedObservable().subscribe((channel) => {
        const exists = this.channels.some(createdChannel => createdChannel.id === channel.id);
        if (!exists) {
          this.channels.push(channel);
          this.updateTreeData();
        }
      });

    });
  }

  // todo
  private async initializeDefaultData() {
    const defaultGroupChannels: TextChannel[] = [
      { id: 'groupChannel1', name: 'Allgemein', assignedUser: [], isPrivate: false, description: 'Allgemeiner Channel', owner: '' },
      { id: 'groupChannel2', name: 'Entwicklerteam', assignedUser: [], isPrivate: false, description: 'Entwickler Channel', owner: '' }
    ];

    const defaultUsers: DABubbleUser[] = [
      { id: '', username: 'User1', mail: 'user1@example.com', isLoggedIn: true, avatar: './img/5.svg', uid: 'uid-user1' },
      { id: '', username: 'User2', mail: 'user2@example.com', isLoggedIn: true, avatar: './img/2.svg', uid: 'uid-user2' },
      { id: '', username: 'User3', mail: 'user4@example.com', isLoggedIn: true, avatar: './img/4.svg', uid: 'uid-user3' }
    ];

    const defaultDirectChannels: TextChannel[] = [
      { id: 'directChannel1', name: 'Direktnachricht 1', assignedUser: [], isPrivate: true, description: '', owner: '' },
      { id: 'directChannel2', name: 'Direktnachricht 2', assignedUser: [], isPrivate: true, description: '', owner: '' }
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
        owner: ''
      };
      const newChannelId = await this.dbService.addChannelDataToDB('channels', directMessage);
      directMessage.id = newChannelId;
      this.channels.push(directMessage);
      await this.updateTreeData();
    }
  }

  hasChild = (_: number, node: FlattenedNode) => node.expandable;

  createGroupChannelNodes(): Node[] {
    const groupChannelNodes = this.channels.filter(channel => !channel.isPrivate && this.isDefined(channel)).map(channel => ({
      id: channel.id,
      name: channel.name,
      type: 'groupChannel' as const,
    }));
    return groupChannelNodes;
  }

  private async createOwnDirectChannelNode(currentUser: DABubbleUser): Promise<Node | null> {
    for (const channel of this.channels) {
      if (channel.isPrivate && this.isDefined(channel) && channel.assignedUser.length === 1 && channel.assignedUser[0] === currentUser.id) {
        const ownDirectChannelNode: Node = {
          id: channel.id,
          name: currentUser.username + " (Du)",
          type: 'directMessage' as const,
          children: [],
          avatar: currentUser.avatar
        };
        return ownDirectChannelNode;
      }
    }
    return null;
  }

  private async createOtherDirectChannelNodes(currentUser: DABubbleUser): Promise<Node[]> {
    const directChannelNodes: Node[] = [];
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
            directChannelNodes.push(node);
          }
        }
      }
    }
    return directChannelNodes;
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

  async openAddChannelDialog() {
    const dialogRef = this.dialog.open(AddChannelComponent);
    dialogRef.afterClosed().subscribe(async (result: TextChannel) => {
      if (result) {
        const newChannel = await this.channelService.createGroupChannel(result);
        if (newChannel) {
          this.channels.push(newChannel);
          await this.updateTreeData();
        }
      }
    });
  }


  isGroupChannel = (node: FlattenedNode): boolean => {
    return (!node.expandable && node.type === 'groupChannel' && node.name !== 'Channel hinzufügen');
  }

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

  private isDefined(channel: TextChannel): channel is TextChannel & { name: string } {
    return channel.name !== undefined;
  }
}
