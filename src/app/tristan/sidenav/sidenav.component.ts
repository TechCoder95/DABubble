/**
 * @module SidenavComponent
 * @description
 * This component provides a sidebar (Sidenav) for use in an Angular application.
 * It enables navigation between different channels and direct messages in a chat application.
 *
 * @requires @angular/common
 * @requires @angular/core
 * @requires @angular/material/sidenav
 * @requires @angular/material/icon
 * @requires @angular/material/button
 * @requires @angular/material/tree
 * @requires @angular/material/dialog
 * @requires @angular/router
 * @requires rxjs
 * @requires ../../shared/interfaces/textchannel
 * @requires ../../shared/interfaces/chatmessage
 * @requires ../../shared/interfaces/user
 * @requires ../../shared/services/channel.service
 * @requires ../../shared/services/user.service
 * @requires ../../shared/services/globalsub.service
 * @requires ../../shared/services/database.service
 * @requires ../add-channel/add-channel.component
 * @requires ../../Dimi/chat/chat.component
 * @requires ../../rabia/new-chat/new-chat.component
 * @requires ../../rabia/thread/thread.component
 * @requires ../../shared/components/header/searchbar/searchbar.component
 */
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  EventEmitter,
} from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddChannelComponent } from '../add-channel/add-channel.component';
import { ChatMessage } from '../../shared/interfaces/chatmessage';
import { ChatComponent } from '../../Dimi/chat/chat.component';
import { ChannelService } from '../../shared/services/channel.service';
import { UserService } from '../../shared/services/user.service';
import { DABubbleUser } from '../../shared/interfaces/user';
import { NewChatComponent } from '../../rabia/new-chat/new-chat.component';
import { Subscription, take, tap } from 'rxjs';
import { ThreadComponent } from '../../rabia/thread/thread.component';
import { GlobalsubService } from '../../shared/services/globalsub.service';
import { User } from 'firebase/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
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
  avatar?: string;
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy {
  workspaceMenuOpen: boolean = true;

  /**
   * @private
   * @description
   * Function to transform nodes into a flattened node model.
   * @param {Node} node - The node to transform.
   * @param {number} level - The depth of the node in the tree.
   * @returns {FlattenedNode} The transformed node.
   */
  private transformer = (node: Node, level: number): FlattenedNode => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    id: node.id,
    level: level,
    type: node.type,
    avatar: node.avatar,
    isLoggedIn: node.isLoggedIn,
  });

  treeControl = new FlatTreeControl<FlattenedNode>(
    (node) => node.level,
    (node) => node.expandable,
  );
  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  channels: TextChannel[] = [];
  TREE_DATA: Node[] = [];
  selectedChannel: Partial<TextChannel> = {};

  messages: ChatMessage[] = [];
  isLoggedIn: boolean | undefined;
  isCurrentUserActivated: boolean | undefined;
  assignedUserMap: { [channelId: string]: DABubbleUser } = {};
  userIsLoggedIn!: boolean;

  @Input({ required: true }) activeUserChange!: any;
  @Input({ required: true }) activeGoogleUserChange!: any;
  @Input({ required: true }) onlineStatusChange!: any;
  activeChannelChange = new EventEmitter<TextChannel>();

  activeUser!: DABubbleUser;
  activeGoogleUser!: User;
  activeChannel!: TextChannel;

  private createdChannelSubscription!: Subscription;
  private activeUserChangeSubscription!: Subscription;
  private routeSubscription!: Subscription;
  private userStatusSubscription!: Subscription;
  private updateTreeSubscription!: Subscription;
  private activeChannelSubscription!: Subscription;

  hasChild = (_: number, node: FlattenedNode) => node.expandable;
  drawer: any;

  /**
   * @constructor
   * @param {MatDialog} dialog - Dialog service to open modal dialogs.
   * @param {ChannelService} channelService - Service to manage channels.
   * @param {UserService} userService - Service to manage user data.
   * @param {GlobalsubService} subscriptionService - Service for managing global subscriptions.
   * @param {Router} router - Angular Router to navigate between routes.
   * @param {ActivatedRoute} route - Provides access to information about a route associated with a component.
   */
  constructor(
    private dialog: MatDialog,
    public channelService: ChannelService,
    private userService: UserService,
    private subscriptionService: GlobalsubService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  /**
   * @public
   * @description
   * Angular lifecycle hook that is called after data-bound properties of a directive are initialized.
   * It initializes the active user and channels, and sets up the necessary subscriptions.
   */
  async ngOnInit() {
    this.activeUser = this.userService.activeUser;
    if (this.activeUser) {
      await this.initializeChannels();
      this.initializeSubscriptions();
    }
  }

  /**
   * @private
   * @description
   * Initializes the channels for the sidebar.
   * It loads user channels and updates the tree data.
   */
  private async initializeChannels() {
    await this.channelService.initializeDefaultData();
    await this.loadUserChannels();
    const ownDirectChannel = await this.channelService.createOwnDirectChannel(
      this.activeUser,
      this.channels,
    );
    if (!this.channels.some((channel) => channel.id === ownDirectChannel.id)) {
      this.channels.push(ownDirectChannel);
    }
    await this.updateTreeData();
  }

  /**
   * @private
   * @description
   * Loads user channels from the session storage.
   */
  private async loadUserChannels() {
    this.channels = JSON.parse(sessionStorage.getItem('channels')!);
  }

  /**
   * @private
   * @description
   * Creates group channel nodes for the tree structure.
   * @returns {Node[]} The list of group channel nodes.
   */
  private createGroupChannelNodes(): Node[] {
    const groupChannelNodes = this.channels
      .filter((channel) => !channel.isPrivate && this.isDefined(channel))
      .map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: 'groupChannel' as const,
      }));

    return groupChannelNodes;
  }

  /**
   * @private
   * @description
   * Creates a node for the user's own direct channel.
   * @param {DABubbleUser} currentUser - The current active user.
   * @returns {Promise<Node | null>} The node representing the user's direct channel, or null if not found.
   */
  private async createOwnDirectChannelNode(
    currentUser: DABubbleUser,
  ): Promise<Node | null> {
    for (const channel of this.channels) {
      if (
        channel.isPrivate &&
        this.isDefined(channel) &&
        channel.assignedUser.length === 1 &&
        channel.assignedUser[0] === currentUser.id
      ) {
        const ownDirectChannelNode: Node = {
          id: channel.id,
          name: `${currentUser.username} (Du)`,
          type: 'directChannel' as const,
          children: [],
          avatar: currentUser.avatar,
          isLoggedIn: true,
        };
        return ownDirectChannelNode;
      }
    }
    return null;
  }

  /**
   * @private
   * @description
   * Creates nodes for direct channels other than the user's own.
   * @param {DABubbleUser} currentUser - The current active user.
   * @returns {Promise<Node[]>} The list of nodes representing other direct channels.
   */
  private async createOtherDirectChannelNodes(currentUser: DABubbleUser) {
    const directChannelNodes: Node[] = [];
    for (const channel of this.channels) {
      if (
        channel.isPrivate &&
        this.isDefined(channel) &&
        !(
          channel.assignedUser.length === 1 &&
          channel.assignedUser[0] === currentUser.id
        )
      ) {
        const otherUserId = channel.assignedUser.find(
          (id) => id !== currentUser.id,
        );
        if (otherUserId) {
          await this.userService.getOneUserbyId(otherUserId).then((newUser) => {
            if (newUser) {
              const node: Node = {
                id: channel.id,
                name: newUser.username,
                type: 'directChannel' as const,
                children: [],
                avatar: newUser.avatar,
                isLoggedIn: newUser.isLoggedIn,
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

  /**
   * @private
   * @description
   * Creates nodes for all direct channels including the user's own and others.
   * @returns {Promise<Node[]>} The list of nodes representing all direct channels.
   */
  private async createDirectChannelNodes(): Promise<Node[]> {
    const directChannelNodes: Node[] = [];
    const currentUser = this.userService.activeUser;
    const ownNode = await this.createOwnDirectChannelNode(currentUser);
    if (ownNode) directChannelNodes.push(ownNode);
    await this.createOtherDirectChannelNodes(currentUser).then((otherNodes) => {
      directChannelNodes.push(...otherNodes);
    });
    return directChannelNodes;
  }

  /**
   * @private
   * @description
   * Updates the tree data structure used in the sidebar.
   */
  private async updateTreeData(): Promise<void> {
    const groupChannelNodes = this.createGroupChannelNodes();
    const directChannelNodes = await this.createDirectChannelNodes();

    const groupChannelsStructure: Node = {
      id: 'channels',
      name: 'Channels',
      type: 'groupChannel',
      children: [
        ...groupChannelNodes,
        {
          id: 'add-channel',
          name: 'Channel hinzufügen',
          type: 'action' as const,
        },
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

  /**
   * @public
   * @description
   * Handles node click events in the sidebar tree. It navigates to the selected channel or opens the add channel dialog.
   * @param {FlattenedNode} node - The node that was clicked.
   */
  async onNode(node: FlattenedNode) {
    if (node.expandable) {
      this.treeControl.toggle(node);
    } else if (this.isGroupChannel(node) || this.isDirectChannel(node)) {
      const selectedChannel = this.channels.find(
        (channel) => channel.id === node.id,
      );
      if (selectedChannel) {
        this.selectedChannel = selectedChannel;
        this.updateHoverStates();
        await this.navToSelectedChannel(selectedChannel);
      }
    } else if (node.type === 'action') {
      this.openAddChannelDialog();
    }
  }

  updateHoverStates() {
    Object.keys(this.hoverStates).forEach((id) => {
      this.hoverStates[id] = id === this.selectedChannel.id;
    });
  }

  hoverStates: { [key: string]: boolean } = {};
  hoverTreeNode(hover: boolean, nodeId: string) {
    this.hoverStates[nodeId] = hover;
  }

  imgWorkspaceOpen: string = './img/default-workspace-open.svg';
  imgworkspaceClosed: string = './img/default-workspace-closed.svg';
  changeWorkspaceImg(hover: boolean) {
    if (hover && this.workspaceMenuOpen) {
      this.imgWorkspaceOpen = './img/hover-workspace-open.svg';
    } else if (!hover && this.workspaceMenuOpen) {
      this.imgWorkspaceOpen = './img/default-workspace-open.svg';
    } else if (hover && !this.workspaceMenuOpen) {
      this.imgworkspaceClosed = './img/hover-workspace-closed.svg';
    } else {
      this.imgworkspaceClosed = './img/default-workspace-closed.svg';
    }
  }

  /**
   * @public
   * @description
   * Opens the dialog to add a new channel.
   */
  async openAddChannelDialog() {
    const dialogRef = this.dialog.open(AddChannelComponent);
    dialogRef.afterClosed().subscribe(async (channel: TextChannel) => {
      if (channel) {                
        const nameExists = await this.channelService.doesChannelNameAlreadyExist(channel.name);
        if (nameExists) {
          // todo fehlermeldung zurück geben eventuell
          alert(`Ein Kanal mit dem Namen "${channel.name}" existiert bereits.`);
          return;
        }
        const newChannel = await this.channelService.createGroupChannel(channel);
        if (newChannel) {
          this.channels.push(newChannel);
          await this.navToSelectedChannel(newChannel);
          await this.updateTreeData();
        }
      }
    });
  }

  /**
   * @public
   * @description
   * Navigates to the selected channel.
   * @param {TextChannel} selectedChannel - The channel to navigate to.
   */
  async navToSelectedChannel(selectedChannel: TextChannel) {
    sessionStorage.setItem('selectedChannel', JSON.stringify(selectedChannel));
    await this.router.navigate(['/home']);
    setTimeout(async () => {
      this.router.navigate(['/home/channel', selectedChannel.id]);
    }, 0.1);
    this.subscriptionService.updateActiveChannel(selectedChannel);
  }

  /**
   * @public
   * @description
   * Navigates to the "Create New Chat" screen.
   */
  async navToCreateNewChat() {
    await this.router.navigate(['/home/new-chat']);
  }

  /**
   * @public
   * @description
   * Determines if the node is a group channel.
   * @param {FlattenedNode} channel - The node to check.
   * @returns {boolean} True if the node is a group channel, otherwise false.
   */
  isGroupChannel = (channel: FlattenedNode): boolean => {
    return (
      !channel.expandable &&
      channel.type === 'groupChannel' &&
      channel.name !== 'Channel hinzufügen'
    );
  };

  /**
   * @public
   * @description
   * Determines if the node is a direct channel.
   * @param {FlattenedNode} channel - The node to check.
   * @returns {boolean} True if the node is a direct channel, otherwise false.
   */
  isDirectChannel(channel: FlattenedNode): boolean {
    return channel.type === 'directChannel';
  }

  /**
   * @public
   * @description
   * Determines if the node is a category node.
   * @param {FlattenedNode} channel - The node to check.
   * @returns {boolean} True if the node is a category node, otherwise false.
   */
  isCategoryNode(channel: FlattenedNode): boolean {
    return channel.type === 'groupChannel' || channel.type === 'directChannel';
  }

  /**
   * @public
   * @description
   * Determines if the node is an action node.
   * @param {FlattenedNode} channel - The node to check.
   * @returns {boolean} True if the node is an action node, otherwise false.
   */
  isActionNode(channel: FlattenedNode): boolean {
    return channel.type === 'action';
  }

  /**
   * @public
   * @description
   * Determines if the node is the currently selected channel.
   * @param {FlattenedNode} node - The node to check.
   * @returns {boolean} True if the node is the selected channel, otherwise false.
   */
  isSelectedChannel(node: FlattenedNode): boolean {
    return this.selectedChannel?.id === node.id;
  }

  /**
   * @private
   * @description
   * Checks if the channel is defined and has a name.
   * @param {TextChannel} channel - The channel to check.
   * @returns {boolean} True if the channel is defined and has a name, otherwise false.
   */
  private isDefined(
    channel: TextChannel,
  ): channel is TextChannel & { name: string } {
    return channel.name !== undefined;
  }

  /**
   * @private
   * @description
   * Sets up various subscriptions used in the component.
   */
  initializeSubscriptions() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const channelId = params.get('channel/channelId');
      if (channelId) {
        const selectedChannel = this.channels.find(
          (channel) => channel.id === channelId,
        );
        if (selectedChannel) {
          this.selectedChannel = selectedChannel;
          this.channelService.selectChannel(selectedChannel);
        }
      }
    });

    this.activeUserChangeSubscription = this.activeUserChange.subscribe(
      async (user: DABubbleUser) => {
        this.activeUser = user;
      },
    );

    this.createdChannelSubscription = this.subscriptionService
      .getChannelCreatedObservable()
      .subscribe(async (channel) => {
        const exists = this.channels.some(
          (createdChannel) => createdChannel.id === channel.id,
        );
        if (!exists) {
          this.channels.push(channel);
          await this.updateTreeData();
        }
      });

    this.userStatusSubscription = this.subscriptionService
      .getUserUpdateFromDatabaseObservable()
      .subscribe(async () => {
        await this.updateTreeData();
      });

    this.updateTreeSubscription = this.subscriptionService
      .getSidenavTreeObservable()
      .subscribe(async () => {
        await this.loadUserChannels();
        await this.updateTreeData();
      });

    this.activeChannelSubscription = this.subscriptionService
      .getActiveChannelObservable()
      .subscribe(async (channel: TextChannel) => {
        const index = this.channels.findIndex((c) => c.id === channel.id);
        if (index !== -1) {
          this.channels[index] = channel;
        } else {
          this.channels.push(channel);
        }

        this.selectedChannel = channel;
        await this.updateTreeData();
      });
  }

  /**
   * @public
   * @description
   * Angular lifecycle hook that is called when a directive, pipe, or service is destroyed.
   * It unsubscribes from all active subscriptions to prevent memory leaks.
   */
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

    if (this.activeChannelSubscription) {
      this.activeChannelSubscription.unsubscribe();
    }
  }
}
