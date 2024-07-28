import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
    NewChatComponent
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
  isCurrentUserActivated: boolean | undefined;
  isLoggedIn: boolean | undefined;

  private userSubscription: Subscription | undefined;

  constructor(
    private dbService: DatabaseService,
    private dialog: MatDialog,
    private channelService: ChannelService,
    private userService: UserService
  ) {
  }

  async ngOnInit() {
    this.userSubscription = this.userService.activeUserObserver$
      .pipe(distinctUntilChanged()).subscribe(async (currentUser) => {
        this.isLoggedIn = currentUser?.isLoggedIn;
        this.isCurrentUserActivated = currentUser?.activated;
        if (currentUser?.activated) {
          await this.loadUserChannels(currentUser);
          await this.initializeDirectMessageForUser(currentUser);
          await this.updateTreeData();
        } else {
          console.log('Kein aktiver Benutzer gefunden');
        }
      });
  }

  async ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
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

  private createGroupChannelNodes(): Node[] {
    const nodes = this.channels
      .filter(channel => !channel.isPrivate && this.isDefined(channel))
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        type: 'groupChannel' as const,
      }));
    return nodes;
  }

  private async createDirectMessageNodes(): Promise<Node[]> {
    const directMessageNodes: Node[] = [];
    for (const channel of this.channels) {
      if (channel.isPrivate && this.isDefined(channel)) {
        const user = await this.userService.getOneUserbyId(channel.assignedUser[0]);
        const node: Node = {
          id: channel.id,
          name: user?.username + " (Du)" || 'Unbekannter Benutzer',
          type: 'directMessage' as const,
          children: [],
          avatar: user?.avatar
        };
        directMessageNodes.push(node);
      }
    }
    return directMessageNodes;
  }

  private async updateTreeData(): Promise<void> {
    const groupChannelNodes = this.createGroupChannelNodes();
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
