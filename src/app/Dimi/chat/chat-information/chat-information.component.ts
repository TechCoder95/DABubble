import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogChannelInformationComponent } from './dialog-channel-information/dialog-channel-information.component';
import { DialogChannelMembersComponent } from './dialog-channel-members/dialog-channel-members.component';
import { DialogAddChannelMembersComponent } from './dialog-add-channel-members/dialog-add-channel-members.component';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { Subscription } from 'rxjs';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { DatabaseService } from '../../../shared/services/database.service';
import {
  GlobalsubService,
  OnlineStatus,
} from '../../../shared/services/globalsub.service';
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
  /*  activeUser!: DABubbleUser; */
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
  /*  private channelSubscription!: Subscription; */
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
    if (this.selectedChannel.isPrivate) this.getPrivateChatPartner();

    this.selectedChannel.assignedUser.forEach((userID) => {
      this.userService.getOneUserbyId(userID).then((user) => {
        this.assignedUsers.push(user as unknown as DABubbleUser);
      });
    });

    this.userStatusSubscription = this.subService
      .getUserUpdateFromDatabaseObservable()
      .subscribe(async (user) => {
        if (user && this.privateChatPartner) {
          this.privateChatPartner!.isLoggedIn = user.isLoggedIn;
        }
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
  }

  ngOnDestroy() {
    if (this.channelSub) {
      this.channelSub.unsubscribe();
    }
    if (this.userStatusSubscription) {
      this.userStatusSubscription.unsubscribe();
    }
  }

  changeTagImg(hover: boolean) {
    if (hover || this.dialogChannelInfoIsOpen) {
      this.tagImg = './img/tag-hover.svg';
      this.arrowImg = './img/arrow-down-hover.svg';
    } else {
      this.tagImg = './img/tag.svg';
      this.arrowImg = './img/keyboard_arrow_down.svg';
    }
  }

  changeAddMembersImg(hover: boolean) {
    if (hover) {
      this.addChannelMembersImg = './img/add-members-hover.svg';
    } else {
      this.addChannelMembersImg = './img/add-members-default.svg';
    }
  }

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
  openDialogAddChannelMembers(event: MouseEvent) {
    this.dialogAddChannelMembersIsOpen = !this.dialogAddChannelMembersIsOpen;
    const dialogConfig = this.handleDialogConfig(event, 'addChannelMembers');
    const dialogRef = this.dialog.open(
      DialogAddChannelMembersComponent,
      dialogConfig,
    );
    this.handleDialogClose(dialogRef);
  }

  handleDialogConfig(event: MouseEvent, dialog: string) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    let dialogConfig = this.returnDialogConfig(rect, dialog);
    return dialogConfig;
  }

  returnDialogConfig(rect: any, position: string) {
    if (position === 'channelInfo') {
      return {
        position: {
          top: `${rect.bottom}px`,
          left: `${rect.left}px`,
        },
        panelClass: 'custom-dialog-container',
      };
    } else if (position === 'allUsers') {
      const dialogWidth = 400;
      return {
        position: {
          top: `${rect.bottom}px`,
          left: `${rect.right - dialogWidth}px`,
        },
        panelClass: 'custom-dialog-container',
        data: { channelMembers: this.assignedUsers },
      };
    } /* else if (position === 'allUsers' && this.windowIsSmall()) {
      const dialogWidth = 350;
      return {
        position: {
          top: `${rect.bottom}px`,
          left: `${rect.right - dialogWidth}px`,
        },
        panelClass: 'custom-dialog-container',
        data: { channelMembers: this.assignedUsers },
      };
    } */ else {
      let dialogWidth: number;
      debugger;
      if (window.innerWidth <= 910) {
        dialogWidth = 350;
      } else {
        dialogWidth = 542;
      }

      return {
        position: {
          top: `${rect.bottom}px`,
          left: `${rect.right - dialogWidth}px`,
        },
        panelClass: 'custom-dialog-container',
        data: { channelMembers: this.assignedUsers },
      };
    }
  }

  handleDialogClose(dialogRef: any) {
    dialogRef.afterClosed().subscribe((result: boolean) => {
      this.dialogChannelInfoIsOpen = result;
      this.dialogChannelMembersIsOpen = result;
      document.body.style.overflow = '';
      this.changeTagImg(this.dialogChannelInfoIsOpen);
    });
  }

  getAssignedUsers(channel: TextChannel): DABubbleUser[] {
    this.assignedUsers = [];
    channel.assignedUser.forEach((userID) => {
      this.userService.getOneUserbyId(userID).then((user) => {
        this.assignedUsers.push(user as unknown as DABubbleUser);
      });
    });
    return this.assignedUsers;
  }

  getExtraUserCount(): number {
    const totalAssignesUsers = this.assignedUsers.length;
    return totalAssignesUsers > 5 ? totalAssignesUsers - 5 : 0;
  }

  getPrivateChatPartner() {
    const privateChatPartnerID = this.selectedChannel.assignedUser.find(
      (userID) => userID !== this.userService.activeUser.id,
    );

    if (privateChatPartnerID) {
      this.userService
        .getOneUserbyId(privateChatPartnerID!)
        .then((privateChatPartner) => {
          this.privateChatPartnerName = privateChatPartner?.username;
          this.privatChatAvatar = privateChatPartner?.avatar;
          this.privateChatPartner = privateChatPartner;
        });
    } else {
      this.privateChatPartnerName =
        this.userService.activeUser.username + ' (Du)';
      this.privatChatAvatar = this.userService.activeUser.avatar;
    }
  }

  async openUserInfo() {
    const member: DABubbleUser | null = await this.getMember();
    if (member) {
      this.dialog.open(OpenUserInfoComponent, {
        data: { member: member },
      });
    }
  }

  async getMember(): Promise<DABubbleUser | null> {
    if (this.selectedChannel.assignedUser.length > 1) {
      const privateChatPartnerID = this.selectedChannel.assignedUser.find(
        (userID) => userID !== this.userService.activeUser.id,
      );
      return await this.userService.getOneUserbyId(privateChatPartnerID!);
    } else return null;
  }

  windowIsSmall() {
    return window.innerWidth <= 910;
  }

  checkDialogToOpen(event: MouseEvent) {
    if (this.windowIsSmall()) {
      this.openDialogChannelMembers(event);
    } else {
      this.openDialogAddChannelMembers(event);
    }
  }
}
