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
import { initializeApp } from 'firebase/app';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchbarComponent } from '../../shared/components/header/searchbar/searchbar.component';


interface Node {
  id: string;
  name: string;
  type: 'groupChannel' | 'directChannel' | 'action';
  children?: Node[];
  avatar?: string;
  isLoggedIn?: boolean;
}

interface FlattenedNode {
  expandable: boolean;
  name: string;
  id: string;
  level: number;
  type: 'groupChannel' | 'directChannel' | 'action';
  avatar?: string
  isLoggedIn?: boolean;
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
    RouterModule,
    MatProgressSpinnerModule
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
    avatar: node.avatar,
    isLoggedIn: node.isLoggedIn
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
  assignedUserMap: { [channelId: string]: DABubbleUser } = {};
  userIsLoggedIn!: boolean;

  @Input({ required: true }) activeUserChange!: any;
  @Input({ required: true }) activeGoogleUserChange!: any;
  activeChannelChange = new EventEmitter<TextChannel>();

  activeUser!: DABubbleUser;
  activeGoogleUser!: User;
  activeChannel!: TextChannel;

  private createdChannelSubscription!: Subscription;
  private activeUserChangeSubscription!: Subscription;
  private routeSubscription!: Subscription;
  private userStatusSubscription!: Subscription;
  private updateTreeSubscription!: Subscription;


  constructor(
    private databaseService: DatabaseService,
    private dialog: MatDialog,
    public channelService: ChannelService,
    private userService: UserService,
    private subscriptionService: GlobalsubService,
    private router: Router,
    private route: ActivatedRoute
  ) { }


  hasChild = (_: number, node: FlattenedNode) => node.expandable;


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
      this.channelService.channelSub.unsubscribe();

    if (this.userStatusSubscription) {
      this.userStatusSubscription.unsubscribe();
    }

    if (this.updateTreeSubscription) {
      this.updateTreeSubscription.unsubscribe();
    }
  }

  async ngOnInit() {
    this.activeUser = this.userService.activeUser;
    if (this.activeUser) {
      this.isLoggedIn = this.activeUser?.isLoggedIn;
      await this.initializeChannels();
      this.initializeSubscriptions();
    }
  }


  initializeSubscriptions() {
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

    this.createdChannelSubscription = this.subscriptionService.getChannelCreatedObservable().subscribe((channel) => {
      const exists = this.channels.some(createdChannel => createdChannel.id === channel.id);
      if (!exists) {
        this.channels.push(channel);
        this.updateTreeData();
      }
    });

    this.userStatusSubscription = this.subscriptionService.getUserUpdateFromDatabaseObservable().subscribe((user: DABubbleUser) => {
      this.updateTreeData();
    });

    this.updateTreeSubscription = this.subscriptionService.getSidenavTreeObservable().subscribe(async () => {
      await this.loadUserChannels();
      await this.updateTreeData();
    });
  }

  private async initializeChannels() {
    await this.channelService.initializeSidenavData();
    await this.loadUserChannels();
    const ownDirectChannel = await this.channelService.createOwnDirectChannel(this.activeUser, this.channels);
    if (!this.channels.some(channel => channel.id === ownDirectChannel.id)) {
      this.channels.push(ownDirectChannel)
    }
    await this.updateTreeData();
  }

  private async loadUserChannels() {
    this.channels = JSON.parse(sessionStorage.getItem('channels')!);
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
          avatar: currentUser.avatar,
          isLoggedIn: true
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
        if (otherUserId) {
          await this.userService.getOneUserbyId(otherUserId).then((newUser) => {
            if (newUser) {
              const node: Node = {
                id: channel.id,
                name: newUser.username,
                type: 'directChannel' as const,
                children: [],
                avatar: newUser.avatar,
                isLoggedIn: newUser.isLoggedIn
              };
              directChannelNodes.push(node);
              this.assignedUserMap[channel.id] = newUser;
            }
          });
        }
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
    await this.createOtherDirectChannelNodes(currentUser).then((otherNodes) => {
      directChannelNodes.push(...otherNodes);
    });
    return directChannelNodes;
  }

  private async updateTreeData(): Promise<void> {
    const groupChannelNodes = this.createGroupChannelNodes();
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
        await this.router.navigate(['/home']);
        setTimeout(async () => {
          this.router.navigate(['/home', selectedChannel.id]);
          await this.navToChannel(selectedChannel.id);
        }, 0.1);
        this.subscriptionService.updateActiveChannel(selectedChannel);
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

  async navToChannel(channelId: string) {
    await this.router.navigate(['/home/channel', channelId]);
  }

  async navToCreateNewChat() {
    await this.router.navigate(['/home/new-chat']);
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
