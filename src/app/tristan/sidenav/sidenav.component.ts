import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

interface Node {
  name: string;
  type: 'category' | 'channel' | 'action' | 'privateMessage';
  children?: Node[];
}

interface FlattenedNode {
  expandable: boolean;
  name: string;
  level: number;
  type: 'category' | 'channel' | 'action' | 'privateMessage';
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
    ChatComponent
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  private TREE_DATA: Node[] = [];
  selectedChannel: TextChannel | null = null;
  messages: ChatMessage[] = [];

  private transformer = (node: Node, level: number): FlattenedNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level: level,
    type: node.type
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
  ) {}

  async ngOnInit() {
    await this.loadChannels();
    this.userService.getUsersFromDB();
    
    const savedChannelId = sessionStorage.getItem('selectedChannelId');
    if (savedChannelId) {
      const savedChannel = this.channels.find(channel => channel.id === savedChannelId);
      if (savedChannel) {
        this.selectedChannel = savedChannel;
        this.channelService.selectChannel(savedChannel);
      }
    }
  }

  hasChild = (_: number, node: FlattenedNode) => node.expandable;

  async addChannel(data: TextChannel) {
    const activeUser = this.userService.activeUser;
    if (activeUser && activeUser.id) {
      const newChannel: TextChannel = { ...data, assignedUser: [activeUser.id] };
      try {
        const newChannelId = await this.dbService.addChannelDataToDB('channels', newChannel);
        newChannel.id = newChannelId; 
        await this.loadChannels(); 
      } catch (err) {
        console.error('Error adding new channel', err);
      }
    }
  }

  private isDefined(channel: TextChannel): channel is TextChannel & { name: string } {
    return channel.name !== undefined;
  }

  private createChannelNodes(): Node[] {
    return this.channels
      .filter(channel => !channel.isPrivate && this.isDefined(channel))
      .map((channel) => ({
        name: channel.name,
        type: 'channel'
      }));
  }

  private createDirectMessageNodes(): Node[] {
    return this.channels
      .filter(channel => channel.isPrivate && this.isDefined(channel))
      .map((dm) => ({
        name: dm.name,
        type: 'channel'
      }));
  }

  private async initializeTreeData(): Promise<void> {
    const channelNodes = this.createChannelNodes();
    const directMessageNodes = this.createDirectMessageNodes();
  
    const channelsStructure: Node = {
      name: 'Channels',
      type: 'category',
      children: [...channelNodes, { name: 'Channel hinzufügen', type: 'action' }],
    };
  
    const directMessagesStructure: Node = {
      name: 'Direktnachrichten',
      type: 'category',
      children: directMessageNodes.length > 0 ? directMessageNodes : [{ name: 'Keine Nachrichten vorhanden', type: 'channel' }],
    };
  
    this.TREE_DATA = [channelsStructure, directMessagesStructure];
    this.dataSource.data = this.TREE_DATA;
  }  

  async loadChannels() {
    const activeUser = this.userService.activeUser;
    if (activeUser && activeUser.id) {
      this.channels = await this.dbService.getUserChannels(activeUser.id);
      await this.initializeTreeData();
    }
  }

  async handleNodeClick(node: FlattenedNode) {
    if (node.expandable) {
      this.treeControl.toggle(node);
    } else if (this.isNewChannel(node)) {
      const selectedChannel = this.channels.find(
        (channel) => channel.name === node.name
      );
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

  isNewChannel = (node: FlattenedNode): boolean => {
    return !node.expandable && node.type === 'channel' && node.name !== 'Channel hinzufügen';
  };

  isChannelNode(node: FlattenedNode): boolean {
    return node.type === 'channel';
  }

  isCategoryNode(node: FlattenedNode): boolean {
    return node.type === 'category';
  }

  isActionNode(node: FlattenedNode): boolean {
    return node.type === 'action';
  }

  isPrivateMessage(node: FlattenedNode): boolean {
    return node.type === 'privateMessage';
  }
  
  isSelectedChannel(node: FlattenedNode): boolean {
    return this.selectedChannel?.name === node.name;
  }
}
