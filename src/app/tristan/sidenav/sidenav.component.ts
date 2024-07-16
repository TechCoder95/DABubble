import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
  children?: Node[];
}

interface FlattenedNode {
  expandable: boolean;
  name: string;
  level: number;
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
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  private TREE_DATA: Node[] = [];
  selectedChannel: TextChannel | null = null;
  messages: ChatMessage[] = [];

  private transformer = (node: Node, level: number): FlattenedNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level: level,
  });

  treeControl = new FlatTreeControl<FlattenedNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  channels: TextChannel[] = [];

  constructor(private dbService: DatabaseService, private dialog: MatDialog, private channelService: ChannelService) { }

  async ngOnInit() {
    await this.loadChannels();
  }

  hasChild = (_: number, node: FlattenedNode) => node.expandable;

  isNewChannel(node: FlattenedNode): boolean {
    return !node.expandable && node.name !== 'Channel hinzufügen' && node.name !== 'Felix Müller' && node.name !== 'Noah Ewen';
  }

  async addChannel(channelName: string) {
    const newChannel: TextChannel = { name: channelName };
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
    return this.channels
      .filter(this.isDefined)
      .map(channel => ({
        name: channel.name
      }));
  }

  private initializeTreeData(channelNodes: Node[]): void {
    const channelsStructure: Node = {
      name: 'Channels',
      children: [
        ...channelNodes,
        { name: 'Channel hinzufügen' }
      ]
    };
    this.TREE_DATA = [channelsStructure];
    this.TREE_DATA.push({
      name: 'Direktnachrichten',
      children: [
        { name: 'Felix Müller' },
        { name: 'Noah Ewen' },
      ],
    });

    this.dataSource.data = this.TREE_DATA;
  }

  async loadChannels() {
    await this.fetchChannels();
    const channelNodes = this.createChannelNodes();
    this.initializeTreeData(channelNodes);
  }

  async handleNodeClick(node: FlattenedNode) {
    if (node.expandable) {
      this.treeControl.toggle(node);
    } else if (this.isNewChannel(node)) {
      const selectedChannel = this.channels.find(channel => channel.name === node.name);
      if (selectedChannel) {
        this.selectedChannel = selectedChannel;
        this.channelService.selectChannel(selectedChannel); 
      }
    } else if (node.name === 'Channel hinzufügen') {
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
}