import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
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
import { distinctUntilChanged, filter, take } from 'rxjs/operators';

interface Node {
  id: string; // Neues Feld hinzugefügt
  name: string;
  type: 'groupchannel' | 'directMessage' | 'action';
  children?: Node[];
  avatar?: string;
}

interface FlattenedNode {
  expandable: boolean;
  name: string;
  id: string; // Neues Feld hinzugefügt
  level: number;
  type: 'groupchannel' | 'directMessage' | 'action';
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
export class SidenavComponent implements OnInit {
  private TREE_DATA: Node[] = [];
  selectedChannel: TextChannel | null = null;
  messages: ChatMessage[] = [];
  newChannel: boolean = false;

  private transformer = (node: Node, level: number): FlattenedNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    id: node.id, // ID wird hier hinzugefügt
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

  constructor(
    private dbService: DatabaseService,
    private dialog: MatDialog,
    private channelService: ChannelService,
    private userService: UserService
  ) {
    console.log('SidenavComponent constructed');
  }

  async ngOnInit() {
    this.userService.activeUserObserver$
      .pipe(
        filter(user => !!user), // Filtere nicht vorhandene Benutzer heraus
        distinctUntilChanged(),
        take(1) // Nimmt nur den ersten Wert und beendet dann die Subscription
      )
      .subscribe(async (currentUser) => {
        console.log('Subscription triggered', currentUser);
        if (currentUser) {
          console.log('Aktueller Benutzer:', currentUser);
          await this.loadUserChannels(currentUser);
          await this.initializeDirectMessageForUser(currentUser);
          await this.initializeTreeData();
        } else {
          console.log('Kein aktiver Benutzer gefunden');
        }
      });
  }

  private async loadUserChannels(currentUser: DABubbleUser) {
    console.log('Loading user channels');
    this.channels = await this.userService.getUserChannels(currentUser.id!);
    console.log('User channels loaded', this.channels);
  }

  private async initializeDirectMessageForUser(currentUser: DABubbleUser) {
    const directMessageExists = this.channels.some(
      (channel) => channel.isPrivate && channel.assignedUser.includes(currentUser.id!)
    );
    console.log("---------------------", directMessageExists);

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
      console.log('Direct message initialized', directMessage);
    }
  }

  hasChild = (_: number, node: FlattenedNode) => node.expandable;

  async addChannel(data: TextChannel) {
    const newChannel: TextChannel = { 
      ...data,
      assignedUser: [this.userService.activeUser.id!],
      isPrivate: false  // Jeder neue Channel hat standardmäßig isPrivate = false
    };
    try {
      const newChannelId = await this.dbService.addChannelDataToDB(
        'channels',
        newChannel
      );
      newChannel.id = newChannelId;
      await this.loadChannels();
    } catch (err) {
      console.error('Error adding new channel', err);
    }
  }

  private isDefined(
    channel: TextChannel
  ): channel is TextChannel & { name: string } {
    return channel.name !== undefined;
  }

  private async fetchChannels(): Promise<void> {
    this.channels = await this.userService.getUserChannels(this.userService.activeUser.id!);
    console.log('Fetched channels', this.channels);
  }

  private createGroupChannelNodes(): Node[] {
    const nodes = this.channels
      .filter(channel => !channel.isPrivate && this.isDefined(channel))
      .map(channel => ({
        id: channel.id, // ID hinzufügen
        name: channel.name,
        type: 'groupchannel' as const,
      }));
    console.log('Group channel nodes created', nodes);
    return nodes;
  }

  private async createDirectMessageNodes(): Promise<Node[]> {
    const directMessageNodes: Node[] = [];
    for (const channel of this.channels) {
      if (channel.isPrivate && this.isDefined(channel)) {
        const user = await this.userService.getOneUserbyId(channel.assignedUser[0]);
        console.log('Avatar for user', user?.username, ':', user?.avatar); // Debug-Log hinzugefügt
        const node: Node = {
          id: channel.id,
          name: user?.username + " (Du)" || 'Unknown User',
          type: 'directMessage' as const,
          children: [],
          avatar: user?.avatar
        };
        console.log('Created node', node); // Debug-Log hinzugefügt
        directMessageNodes.push(node);
      }
    }
    console.log("Direct message nodes", directMessageNodes); // Debug-Log hinzugefügt
    return directMessageNodes;
  }
  
  private async initializeTreeData(): Promise<void> {
    const groupChannelNodes = this.createGroupChannelNodes();
    const directMessageNodes = await this.createDirectMessageNodes();
  
    const channelsStructure: Node = {
      id: 'channels',
      name: 'Channels',
      type: 'groupchannel',
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
    console.log('Tree data initialized', JSON.stringify(this.TREE_DATA, null, 2)); // Detailliertes Debug-Log hinzugefügt
  }
  

  async loadChannels() {
    await this.fetchChannels();
    await this.initializeTreeData();
  }

  async handleNodeClick(node: FlattenedNode) {
    console.log('Node clicked', node);
    if (node.expandable) {
      this.treeControl.toggle(node);
    } else if (this.isGroupChannel(node) || this.isDirectMessage(node)) {
      const selectedChannel = this.channels.find(
        (channel) => channel.id === node.id // Nach ID suchen
      );
      console.log('Selected channel', selectedChannel);
      if (selectedChannel) {
        this.selectedChannel = selectedChannel;
        this.channelService.selectChannel(selectedChannel);
        sessionStorage.setItem('selectedChannelId', selectedChannel.id);
      }
    } else if (node.type === 'action') {
      this.openDialog();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddChannelComponent);
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.addChannel(result);
      }
    });
  }

  isGroupChannel = (node: FlattenedNode): boolean => {
    return (
      !node.expandable &&
      node.type === 'groupchannel' &&
      node.name !== 'Channel hinzufügen'
    );
  };

  isDirectMessage(node: FlattenedNode): boolean {
    return node.type === 'directMessage';
  }

  isCategoryNode(node: FlattenedNode): boolean {
    return node.type === 'groupchannel' || node.type === 'directMessage';
  }

  isActionNode(node: FlattenedNode): boolean {
    return node.type === 'action';
  }

  isSelectedChannel(node: FlattenedNode): boolean {
    return this.selectedChannel?.id === node.id;
  }

  openNewMessage() {
    this.newChannel = true;
    console.log('olaa lo', this.newChannel);
  }
}
