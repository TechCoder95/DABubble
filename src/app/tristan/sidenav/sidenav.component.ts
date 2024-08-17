import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input, EventEmitter } from '@angular/core';
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
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { SearchbarComponent } from '../../shared/components/header/searchbar/searchbar.component';


interface Node {
  id: string;
  name: string;
  type: 'groupChannel' | 'directChannel' | 'action';
  children?: Node[];
  avatar?: string;
}

interface FlattenedNode {
  expandable: boolean;
  name: string;
  id: string;
  level: number;
  type: 'groupChannel' | 'directChannel' | 'action';
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
    SearchbarComponent,
    RouterModule
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
  selectedChannel!: TextChannel;
  messages: ChatMessage[] = [];
  isLoggedIn: boolean | undefined;
  isCurrentUserActivated: boolean | undefined;

  @Input({ required: true }) activeUserChange!: any;
  @Input({ required: true }) activeGoogleUserChange!: any;
  activeChannelChange = new EventEmitter<TextChannel>();

  activeUser!: DABubbleUser;
  activeGoogleUser!: User;
  activeChannel!: TextChannel;

  private createdChannelSubscription!: Subscription;
  private activeUserChangeSubscription!: Subscription;
  private routeSubscription!: Subscription;


  constructor(
    private dbService: DatabaseService,
    private dialog: MatDialog,
    public channelService: ChannelService,
    private userService: UserService,
    private subService: GlobalsubService,
    private router: Router,
    private route: ActivatedRoute
  ) { }


  hasChild = (_: number, node: FlattenedNode) => node.expandable;


  unsubscribeFromChannel() {
    if (this.channelService.channelSub)
      this.channelService.channelSub.unsubscribe();
    console.log('Unsubscribed from channel');

  }



  async ngOnDestroy() {
    if (this.createdChannelSubscription) {
      this.createdChannelSubscription.unsubscribe();
    }

    if (this.activeUserChangeSubscription) {
      this.activeUserChangeSubscription.unsubscribe();
    }

    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    if (this.channelService.channelSub)
      this.unsubscribeFromChannel();

  }

  async ngOnInit() {

    this.activeUser = this.userService.activeUser;
    this.isLoggedIn = this.activeUser?.isLoggedIn;

    if (this.activeUser) {
      await this.initializeChannels();

      this.routeSubscription = this.route.paramMap.subscribe(params => {
        const channelId = params.get('channel/channelId');
        if (channelId) {
          const selectedChannel = this.channels.find(channel => channel.id === channelId);
          if (selectedChannel) {
            this.selectedChannel = selectedChannel;
            this.channelService.selectChannel(selectedChannel);
          }
        }
      });

      this.activeUserChangeSubscription = this.activeUserChange.subscribe(async (user: DABubbleUser) => {
        this.activeUser = user;
      });

      this.createdChannelSubscription = this.subService.getChannelCreatedObservable().subscribe((channel) => {
        const exists = this.channels.some(createdChannel => createdChannel.id === channel.id);
        if (!exists) {
          this.channels.push(channel);
          this.updateTreeData();
        }
      });
    }
  }


  private async initializeChannels() {
    // await this.initializeDefaultData();
    await this.loadUserChannels(this.activeUser);
    const ownDirectChannel = await this.channelService.createOwnDirectChannel(this.activeUser, this.channels);
    if (!this.channels.some(channel => channel.id === ownDirectChannel.id)) {
      this.channels.push(ownDirectChannel);
    }
    await this.updateTreeData();
  }

  // todo


  private async initializeDefaultData() {
    const userIdMap: { [key: string]: string } = {};

    const defaultUsers: DABubbleUser[] = [
      { id: '', username: 'Felix', mail: 'Felix@example.com', isLoggedIn: true, avatar: '/img/avatar.svg', uid: 'Felix-uid' },
      { id: '', username: 'Jimmy', mail: 'Jimmy@example.com', isLoggedIn: true, avatar: '/img/avatar.svg', uid: 'Jimmy-uid' },
      { id: '', username: 'Mia', mail: 'Mia@example.com', isLoggedIn: true, avatar: '/img/avatar.svg', uid: 'Mia-uid' }
    ];

    // Überprüfe und füge Standardbenutzer hinzu
    for (const user of defaultUsers) {
      const existingUser = await this.userService.getDefaultUserByUid(user.uid!);
      if (!existingUser) {
        const userId = await this.userService.addDefaultUserToDatabase(user);
        userIdMap[user.username] = userId;
      } else {
        userIdMap[user.username] = existingUser.id!;
        console.log(`User ${user.username} already exists.`);
      }
    }

    // Prüfe das Mapping
    console.log("User ID Mapping:", userIdMap);

    // Jetzt kannst du die IDs der erstellten Benutzer verwenden, um die Kanäle zu erstellen
    const defaultGroupChannels: TextChannel[] = [
      { id: 'groupChannel1', name: 'Allgemein', assignedUser: Object.values(userIdMap), isPrivate: false, description: 'Hier werden alle Benutzer geladen.', owner: '' },
      { id: 'groupChannel2', name: 'Entwicklerteam', assignedUser: Object.values(userIdMap), isPrivate: false, description: 'Ein super tolles Entwicklerteam', owner: '' }
    ];

    const defaultDirectChannels: TextChannel[] = [
      { id: 'directChannel1', name: 'Felix', assignedUser: [this.activeUser.id!, userIdMap['Felix']], isPrivate: true, description: '', owner: '' },
      { id: 'directChannel2', name: 'Jimmy', assignedUser: [this.activeUser.id!, userIdMap['Jimmy']], isPrivate: true, description: '', owner: '' },
      { id: 'directChannel3', name: 'Mia', assignedUser: [this.activeUser.id!, userIdMap['Mia']], isPrivate: true, description: '', owner: '' }
    ];

    // Überprüfe und füge Standard-Gruppenkanäle hinzu
    for (const groupChannel of defaultGroupChannels) {
      const existingGroupChannel = this.channels.find(channel =>
        channel.name === groupChannel.name &&
        channel.isPrivate === groupChannel.isPrivate &&
        this.arrayEquals(channel.assignedUser, groupChannel.assignedUser)
      );

      if (!existingGroupChannel) {
        const newChannelId = await this.dbService.addChannelDataToDB('channels', groupChannel);
        this.channels.push({ ...groupChannel, id: newChannelId });
      } else {
        console.log(`Group channel ${groupChannel.name} already exists.`);
      }
    }

    // Überprüfe und füge Standard-Direktnachrichten hinzu
    for (const directChannel of defaultDirectChannels) {
      const existingDirectChannel = this.channels.find(channel =>
        channel.isPrivate &&
        this.arrayEquals(channel.assignedUser, directChannel.assignedUser)
      );

      if (!existingDirectChannel) {
        const newChannelId = await this.dbService.addChannelDataToDB('channels', directChannel);
        this.channels.push({ ...directChannel, id: newChannelId });
      } else {
        console.log(`Direct channel ${directChannel.name} already exists.`);
      }
    }
  }

  // Hilfsfunktion zum Vergleich von Arrays (unabhängig von der Reihenfolge)
  arrayEquals(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((value, index) => value === sortedB[index]);
  }





  private async loadUserChannels(currentUser: DABubbleUser) {
    this.channels = await this.userService.getUserChannels(currentUser.id!);
  }


  private createGroupChannelNodes(): Node[] {
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
          name: `${currentUser.username} (Du)`,
          type: 'directChannel' as const,
          children: [],
          avatar: currentUser.avatar
        };
        return ownDirectChannelNode;
      }
    }
    return null;
  }

  private async createOtherDirectChannelNodes(currentUser: DABubbleUser) {
    const directChannelNodes: Node[] = [];
    for (const channel of this.channels) {
      if (channel.isPrivate && this.isDefined(channel) && !(channel.assignedUser.length === 1 && channel.assignedUser[0] === currentUser.id)) {
        const otherUserId = channel.assignedUser.find(id => id !== currentUser.id);
        const user = await this.userService.getOneUserbyId(otherUserId!).then((userNew) => {
          if (userNew) {
            const node: Node = {
              id: channel.id,
              name: userNew.username,
              type: 'directChannel' as const,
              children: [],
              avatar: userNew.avatar
            };
            directChannelNodes.push(node);
          }
        });
      }
    }
    return directChannelNodes;
  }

  private async createDirectChannelNodes(): Promise<Node[]> {
    const directChannelNodes: Node[] = [];
    const currentUser = this.userService.activeUser;
    const ownNode = await this.createOwnDirectChannelNode(currentUser);
    if (ownNode)
      directChannelNodes.push(ownNode);
    const otherNodes = await this.createOtherDirectChannelNodes(currentUser).then((otherNodes) => {
      directChannelNodes.push(...otherNodes);
    });
    return directChannelNodes;
  }

  private async updateTreeData(): Promise<void> {
    const groupChannelNodes = await this.createGroupChannelNodes();
    const directChannelNodes = await this.createDirectChannelNodes();

    const groupChannelsStructure: Node = {
      id: 'channels',
      name: 'Channels',
      type: 'groupChannel',
      children: [
        ...groupChannelNodes,
        { id: 'add-channel', name: 'Channel hinzufügen', type: 'action' as const },
      ],
    };

    const directChannelStructure: Node = {
      id: 'direct-channels',
      name: 'Direktnachrichten',
      type: 'directChannel',
      children: directChannelNodes,
    };

    this.TREE_DATA = [groupChannelsStructure, directChannelStructure];
    this.dataSource.data = this.TREE_DATA;
    this.treeControl.expandAll();
  }

  async onNode(node: FlattenedNode) {
    if (node.expandable) {
      this.treeControl.toggle(node);
    }
    else if (this.isGroupChannel(node) || this.isDirectChannel(node)) {
      const selectedChannel = this.channels.find(
        (channel) => channel.id === node.id
      );
      if (selectedChannel) {
        this.selectedChannel = selectedChannel;
        sessionStorage.setItem('selectedChannel', JSON.stringify(selectedChannel));
        this.router.navigate(['/home']);
        setTimeout(() => {
          this.router.navigate(['/home', selectedChannel.id]);
          this.navToChannel(selectedChannel.id);
        }, 0.1);
        this.subService.updateActiveChannel(selectedChannel);
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

  navToChannel(channelId: string) {
    this.router.navigate(['/home/channel', channelId]);
  }

  navToCreateNewChat() {
    this.router.navigate(['/home/new-chat']);
  }

  isGroupChannel = (channel: FlattenedNode): boolean => {
    return (!channel.expandable && channel.type === 'groupChannel' && channel.name !== 'Channel hinzufügen');
  }

  isDirectChannel(channel: FlattenedNode): boolean {
    return channel.type === 'directChannel';
  }

  isCategoryNode(channel: FlattenedNode): boolean {
    return channel.type === 'groupChannel' || channel.type === 'directChannel';
  }

  isActionNode(channel: FlattenedNode): boolean {
    return channel.type === 'action';
  }

  isSelectedChannel(node: FlattenedNode): boolean {
    return this.selectedChannel?.id === node.id;
  }

  private isDefined(channel: TextChannel): channel is TextChannel & { name: string } {
    return channel.name !== undefined;
  }
}
