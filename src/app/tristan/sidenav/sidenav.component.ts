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
    ChatComponent,
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
    private channelService: ChannelService
  ) {}

  async ngOnInit() {
    await this.loadChannels();
  }

  hasChild = (_: number, node: FlattenedNode) => node.expandable;

  isNewChannel = (node: FlattenedNode): boolean => {
    return !node.expandable && node.type === 'channel' && node.name !== 'Channel hinzufügen';
  };

  async addChannel(data: TextChannel) {
    const newChannel: TextChannel = { ...data };
    await this.dbService.addDataToDB('channels', newChannel);
    await this.loadChannels();
  }

  private isDefined(channel: TextChannel): channel is TextChannel & { name: string } {
    return channel.name !== undefined;
  }

  private async fetchChannels(): Promise<void> {
    this.channels = [];
    await this.dbService.readDatafromDB('channels', this.channels);
  }

  private createChannelNodes(): Node[] {
    return this.channels.filter(this.isDefined).map((channel) => ({
      name: channel.name,
      type: 'channel'
    }));
  }

  // todo daten aus datenbank laden
  private async loadMessages(): Promise<any[]> {
    return [
      { name: 'Felix Müller', type: 'privateMessage' },
      { name: 'Noah Ewen', type: 'privateMessage' }
    ];
  }

  private createDirectMessageNodes(directMessages: TextChannel[]): Node[] {
    return directMessages.filter(this.isDefined).map((dm) => ({
      name: dm.name,
      type: 'privateMessage'
    }));
  }

  private async initializeTreeData(): Promise<void> {
    const channelNodes = this.createChannelNodes();
    const directMessages = await this.loadMessages();
    const directMessageNodes = this.createDirectMessageNodes(directMessages);

    const channelsStructure: Node = {
      name: 'Channels',
      type: 'category',
      children: [...channelNodes, { name: 'Channel hinzufügen', type: 'action' }],
    };

    const directMessagesStructure: Node = {
      name: 'Direktnachrichten',
      type: 'category',
      children: [...directMessageNodes],
    };

    this.TREE_DATA = [channelsStructure, directMessagesStructure];
    this.dataSource.data = this.TREE_DATA;
    //console.log(this.TREE_DATA);
  }

  async loadChannels() {
    await this.fetchChannels();
    await this.initializeTreeData();
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
      }
    } else if (node.type === 'action') {
      this.openDialog();
    } else if (node.type === 'privateMessage') {
      // öffne chat
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