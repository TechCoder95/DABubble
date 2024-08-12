import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogChannelInformationComponent } from './dialog-channel-information/dialog-channel-information.component';
import { ComponentType } from '@angular/cdk/portal';
import { DialogChannelMembersComponent } from './dialog-channel-members/dialog-channel-members.component';
import { DialogAddChannelMembersComponent } from './dialog-add-channel-members/dialog-add-channel-members.component';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { Subscription } from 'rxjs';
import { TextChannel } from '../../../shared/interfaces/textchannel';

@Component({
  selector: 'app-chat-information',
  standalone: true,
  imports: [CommonModule, MatDialogModule, DialogChannelInformationComponent],
  templateUrl: './chat-information.component.html',
  styleUrl: './chat-information.component.scss',
})
export class ChatInformationComponent implements OnInit {
  isChannel: boolean = true;
  activeUser!: DABubbleUser;
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

  @Input() activeUserFromChat: any;
  @Input() activeChannelFromChat: any;

  constructor(
    public dialog: MatDialog,
    public channelService: ChannelService,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {

    this.activeUserFromChat.subscribe((user: any) => {
      this.activeUser = user;

    });

    this.activeChannelFromChat.subscribe((channel: any) => {
      this.getAssignedUsers(channel);
    });

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
        dialogConfig
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
      dialogConfig
    );
    this.handleDialogClose(dialogRef);
  }

  dialogAddChannelMembersIsOpen: boolean = false;
  openDialogAddChannelMembers(event: MouseEvent) {
    this.dialogAddChannelMembersIsOpen = !this.dialogAddChannelMembersIsOpen;
    const dialogConfig = this.handleDialogConfig(event, 'addChannelMembers');
    const dialogRef = this.dialog.open(
      DialogAddChannelMembersComponent,
      dialogConfig
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
      const dialogWidth = 432;
      return {
        position: {
          top: `${rect.bottom}px`,
          left: `${rect.right - dialogWidth}px`,
        },
        panelClass: 'custom-dialog-container',
        data: { channelMembers: this.assignedUsers },
      };
    } else {
      const dialogWidth = 542;
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

  getPrivateChatPartner(selectChannel: TextChannel) {
    const privateChatPartnerID = selectChannel.assignedUser.find(
      (userID) => userID !== this.activeUser.id
    );

    if (privateChatPartnerID) {
      this.userService.getOneUserbyId(privateChatPartnerID!).then((privateChatPartner) => {
        let chatPartner = privateChatPartner as unknown as DABubbleUser;
        this.privateChatPartnerName = chatPartner?.username
        this.privateChatPartner = chatPartner;
      });

    } else {
      this.privateChatPartnerName = this.activeUser.username + ' (Du)';
    }
    this.returnChatPartnerAvatar(selectChannel);
  }

  returnChatPartnerAvatar(selectChannel: TextChannel) {
    if (selectChannel.assignedUser.length > 1) {
      this.privatChatAvatar = this.privateChatPartner?.avatar;
    } else {
      this.privatChatAvatar = this.activeUser.avatar;
    }
  }
}
