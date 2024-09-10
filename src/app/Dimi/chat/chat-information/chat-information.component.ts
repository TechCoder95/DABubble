import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogModule,
} from '@angular/material/dialog';
import { DialogChannelInformationComponent } from './dialog-channel-information/dialog-channel-information.component';
import { DialogChannelMembersComponent } from './dialog-channel-members/dialog-channel-members.component';
import { DialogAddChannelMembersComponent } from './dialog-add-channel-members/dialog-add-channel-members.component';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { Subscription } from 'rxjs';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { GlobalsubService } from '../../../shared/services/globalsub.service';
import { OpenUserInfoComponent } from '../../../rabia/open-user-info/open-user-info.component';

@Component({
  selector: 'app-chat-information',
  standalone: true,
  imports: [CommonModule, MatDialogModule, DialogChannelInformationComponent],
  templateUrl: './chat-information.component.html',
  styleUrl: './chat-information.component.scss',
})
export class ChatInformationComponent implements OnInit {
  isChannel: boolean = true;
  tagImg = './img/tag.svg';
  arrowImg = './img/keyboard_arrow_down.svg';
  tagImgClass = '';
  dialogChannelInfoIsOpen: boolean = false;
  addChannelMembersImg = './img/add-members-default.svg';
  assignedUsers: DABubbleUser[] = [];
  isPrivateChat!: boolean;
  privateChatPartner?: DABubbleUser;
  privatChatAvatar!: string | undefined;
  privateChatPartnerName!: string | undefined;
  channelSub!: Subscription;
  statusSub!: Subscription;

  selectedChannel!: TextChannel;

  @Input() activeUserFromChat: any;
  @Input() activeChannelFromChat: any;
  userStatusSubscription!: Subscription;

  constructor(
    public dialog: MatDialog,
    public channelService: ChannelService,
    private userService: UserService,
    private subService: GlobalsubService,
  ) {
    this.selectedChannel = JSON.parse(
      sessionStorage.getItem('selectedChannel') || '{}',
    );
  }

  ngOnInit(): void {
    if (this.selectedChannel.isPrivate)
      this.setPrivateChatPartner();

    this.selectedChannel.assignedUser.forEach((userID) => {
      this.userService.getOneUserbyId(userID).then((user) => {
        this.assignedUsers.push(user as unknown as DABubbleUser);
      });
    });

    this.userStatusSubscription = this.subService.getUserObservable().subscribe(async (user) => {
        if (this.privateChatPartner) {
          this.privateChatPartner!.isLoggedIn = user.isLoggedIn;
        }
        this.privateChatPartnerName = user.username;
        this.privatChatAvatar = user.avatar;        
      });

    this.channelSub = this.activeChannelFromChat.subscribe((channel: any) => {
      this.selectedChannel = channel;
      this.assignedUsers = [];
      channel.assignedUser.forEach((userID: string) => {
        this.userService.getOneUserbyId(userID).then((user) => {
          this.assignedUsers.push(user as unknown as DABubbleUser);
        });
      });
    });

    this.checkDialogSettings();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.checkDialogSettings();
  }

  ngOnDestroy() {
    if (this.channelSub) {
      this.channelSub.unsubscribe();
    }
    if (this.userStatusSubscription) {
      this.userStatusSubscription.unsubscribe();
    }
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  /**
   * Changes the tag and arrow images based on the hover state and the dialog channel info state.
   *
   * @param hover - A boolean indicating whether the element is being hovered over.
   */
  changeTagImg(hover: boolean) {
    if (hover || this.dialogChannelInfoIsOpen) {
      this.tagImg = './img/tag-hover.svg';
      this.arrowImg = './img/arrow-down-hover.svg';
    } else {
      this.tagImg = './img/tag.svg';
      this.arrowImg = './img/keyboard_arrow_down.svg';
    }
  }

  /**
   * Changes the image for adding members based on the hover state.
   *
   * @param hover - A boolean indicating whether the mouse is hovering over the image.
   */
  changeAddMembersImg(hover: boolean) {
    if (hover) {
      this.addChannelMembersImg = './img/add-members-hover.svg';
    } else {
      this.addChannelMembersImg = './img/add-members-default.svg';
    }
  }

  /**
   * Opens the channel information dialog.
   *
   * @param event - The mouse event that triggered the function.
   */
  openDialogChannelInformation(event: MouseEvent) {
    if (!this.isPrivateChat) {
      this.dialogChannelInfoIsOpen = !this.dialogChannelInfoIsOpen;
      if (this.dialogChannelInfoIsOpen) {
        document.body.style.overflow = 'hidden';
      }
      this.changeTagImg(this.dialogChannelInfoIsOpen);
      const dialogConfig = this.handleDialogConfig(event, 'channelInfo');
      const dialogRef = this.dialog.open(
        DialogChannelInformationComponent,
        dialogConfig,
      );
      this.handleDialogClose(dialogRef);
    }
  }

  dialogChannelMembersIsOpen: boolean = false;
  /**
   * Opens the dialog for channel members.
   *
   * @param event - The mouse event that triggered the function.
   */
  openDialogChannelMembers(event: MouseEvent) {
    this.dialogChannelMembersIsOpen = !this.dialogChannelMembersIsOpen;
    const dialogConfig = this.handleDialogConfig(event, 'allUsers');
    const dialogRef = this.dialog.open(
      DialogChannelMembersComponent,
      dialogConfig,
    );
    this.handleDialogClose(dialogRef);
  }

  dialogAddChannelMembersIsOpen: boolean = false;
  /**
   * Opens the dialog for adding channel members.
   *
   * @param event - The mouse event that triggered the function.
   */
  openDialogAddChannelMembers(event: MouseEvent) {
    this.dialogAddChannelMembersIsOpen = !this.dialogAddChannelMembersIsOpen;
    const dialogConfig = this.handleDialogConfig(event, 'addChannelMembers');
    const dialogRef = this.dialog.open(
      DialogAddChannelMembersComponent,
      dialogConfig,
    );
    this.handleDialogClose(dialogRef);
  }

  /**
   * Handles the dialog configuration based on the provided event and dialog name.
   *
   * @param event - The mouse event that triggered the dialog configuration.
   * @param dialog - The name of the dialog.
   * @returns The dialog configuration object.
   */
  handleDialogConfig(event: MouseEvent, dialog: string) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    let dialogConfig = this.returnDialogConfig(rect, dialog);
    return dialogConfig;
  }

  returnDialogConfig(rect: any, dialog: string) {
    if (dialog === 'channelInfo') {
      return this.returnDialogConfigChannelInfo(rect);
    } else if (dialog === 'allUsers' && !this.windowIsSmall()) {
      return this.returnDialogConfigAllUsersLargeScreen(rect);
    } else if (dialog === 'allUsers' && this.windowIsSmall()) {
      return this.returnDialogConfigAllUsersSmallScreen(rect);
    } else {
      return this.returnDialogConfigAddUsers(rect);
    }
  }

  returnDialogConfigChannelInfo(rect: any) {
    return {
      position: {
        top: `${rect.bottom}px`,
        left: `${rect.left}px`,
      },
      panelClass: 'custom-dialog-container',
      data: {
        channelMembers: this.assignedUsers,
        isMobileAndInChannelInformation: this.isMobileAndInChannelInformation,
      },
    };
  }

  returnDialogConfigAllUsersSmallScreen(rect: any) {
    const dialogWidth = 310;
    return {
      position: {
        top: `${rect.bottom}px`,
        left: `${rect.right - dialogWidth}px`,
      },
      panelClass: 'custom-dialog-container',
      data: { channelMembers: this.assignedUsers },
    };
  }

  returnDialogConfigAllUsersLargeScreen(rect: any) {
    const dialogWidth = 400;
    return {
      position: {
        top: `${rect.bottom}px`,
        left: `${rect.right - dialogWidth}px`,
      },
      panelClass: 'custom-dialog-container',
      data: { channelMembers: this.assignedUsers },
    };
  }

  returnDialogConfigAddUsers(rect: any) {
    const dialogWidth: number = 542;
    return {
      position: {
        top: `${rect.bottom}px`,
        left: `${rect.right - dialogWidth - 40}px`,
      },
      panelClass: 'custom-dialog-container',
      data: { channelMembers: this.assignedUsers },
    };
  }

  /**
   * Handles the closing of a dialog.
   *
   * @param dialogRef - The reference to the dialog.
   */
  handleDialogClose(dialogRef: any) {
    dialogRef.afterClosed().subscribe((result: boolean) => {
      this.dialogChannelInfoIsOpen = result;
      this.dialogChannelMembersIsOpen = result;
      document.body.style.overflow = '';
      this.changeTagImg(this.dialogChannelInfoIsOpen);
    });
  }

  /**
   * Retrieves the assigned users for a given channel.
   *
   * @param channel - The TextChannel object representing the channel.
   * @returns An array of DABubbleUser objects representing the assigned users.
   */
  getAssignedUsers(channel: TextChannel): DABubbleUser[] {
    this.assignedUsers = [];
    channel.assignedUser.forEach((userID) => {
      this.userService.getOneUserbyId(userID).then((user) => {
        this.assignedUsers.push(user as unknown as DABubbleUser);
      });
    });
    return this.assignedUsers;
  }

  /**
   * Calculates the number of extra users beyond the first 5 assigned users.
   * @returns The number of extra users.
   */
  getExtraUserCount(): number {
    const totalAssignesUsers = this.assignedUsers.length;
    return totalAssignesUsers > 5 ? totalAssignesUsers - 5 : 0;
  }

  /**
   * Retrieves the private chat partner for the selected channel.
   * If there is a private chat partner, it fetches the user details using the partner's ID
   * and assigns the partner's name, avatar, and user object to the corresponding properties.
   * If there is no private chat partner, it assigns the active user's name and avatar to the corresponding properties.
   */
  setPrivateChatPartner() {
    const privateChatPartnerID = this.selectedChannel.assignedUser.find((userID) => userID !== this.userService.activeUser.id);

    if (privateChatPartnerID) {
      this.userService.getOneUserbyId(privateChatPartnerID!)
        .then((privateChatPartner) => {
          this.privateChatPartnerName = privateChatPartner?.username;
          this.privatChatAvatar = privateChatPartner?.avatar;
          this.privateChatPartner = privateChatPartner;
        });
    } else {
      this.privateChatPartnerName = this.userService.activeUser.username + ' (Du)';
      this.privatChatAvatar = this.userService.activeUser.avatar;
    }
  }

  /**
   * Opens the user information dialog.
   *
   * @returns {Promise<void>} A promise that resolves when the dialog is closed.
   */
  async openUserInfo() {
    const member: DABubbleUser | null = await this.getMember();
    if (member) {
      this.dialog.open(OpenUserInfoComponent, {
        data: { member: member },
      });
    }
  }

  /**
   * Retrieves the member associated with the selected channel.
   *
   * @returns A Promise that resolves to a DABubbleUser object representing the member, or null if no member is found.
   */
  async getMember(): Promise<DABubbleUser | null> {
    if (this.selectedChannel.assignedUser.length > 1) {
      const privateChatPartnerID = this.selectedChannel.assignedUser.find(
        (userID) => userID !== this.userService.activeUser.id,
      );
      return await this.userService.getOneUserbyId(privateChatPartnerID!);
    } else return null;
  }

  /**
   * Determines if the window size is small.
   * @returns {boolean} Returns true if the window width is less than or equal to 910, otherwise returns false.
   */
  windowIsSmall() {
    return window.innerWidth <= 1250;
  }

  /**
   * Checks the dialog to open based on the size of the window.
   * If the window is small, opens the dialog for channel members.
   * If the window is not small, opens the dialog to add channel members.
   *
   * @param event - The mouse event that triggered the function.
   */
  checkDialogToOpen(event: MouseEvent) {
    if (this.windowIsSmall()) {
      this.openDialogChannelMembers(event);
    } else {
      this.openDialogAddChannelMembers(event);
    }
  }

  isMobileAndInChannelInformation!: boolean;
  checkDialogSettings() {
    if (window.innerWidth < 1250) {
      this.isMobileAndInChannelInformation = true;
    } else {
      this.isMobileAndInChannelInformation = false;
    }
  }
}
