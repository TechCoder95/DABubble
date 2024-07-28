import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class ChatInformationComponent {
  activeUser!: DABubbleUser;
  isChannel: boolean = true;
  tagImg = './img/tag.png';
  arrowImg = './img/keyboard_arrow_down.png';
  tagImgClass = '';
  dialogChannelInfoIsOpen: boolean = false;
  addChannelMembersImg = './img/add-members-default.png';
  assignedUsers: DABubbleUser[] = [];
  /*  private channelSubscription!: Subscription; */

  constructor(
    public dialog: MatDialog,
    public channelService: ChannelService,
    private userService: UserService,
  ) {
    this.activeUser = this.userService.activeUser;
  }

  ngOnInit(): void {
    this.subscribeToChannelChanges();
  }

  subscribeToChannelChanges() {
    this.channelService.selectedChannel$.subscribe((selectedChannel$: any) => {
      if (selectedChannel$) {
        this.assignedUsers = this.getAssignedUsers(selectedChannel$);
      }
    });
  }

  changeTagImg(hover: boolean) {
    if (hover || this.dialogChannelInfoIsOpen) {
      this.tagImg = './img/tag-hover.png';
      this.arrowImg = './img/arrow-down-hover.png';
    } else {
      this.tagImg = './img/tag.png';
      this.arrowImg = './img/keyboard_arrow_down.png';
    }
  }

  changeAddMembersImg(hover: boolean) {
    if (hover) {
      this.addChannelMembersImg = './img/add-members-hover.png';
    } else {
      this.addChannelMembersImg = './img/add-members-default.png';
    }
  }

  openDialogChannelInformation(event: MouseEvent) {
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

  dialogChannelMembersIsOpen: boolean = false;
  openDialogChannelMembers(event: MouseEvent) {
    this.dialogChannelMembersIsOpen = !this.dialogChannelMembersIsOpen;
    const dialogConfig = this.handleDialogConfig(event, 'channelMembers');
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
    } else if (position === 'channelMembers') {
      const dialogWidth = 372;
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
      let user: any = this.userService.getOneUserbyId(userID);
      if (user) {
        this.assignedUsers.push(user);
      }
    });
    return this.assignedUsers;
  }

  getExtraUserCount(): number {
    const totalAssignesUsers = this.assignedUsers.length;
    return totalAssignesUsers > 5 ? totalAssignesUsers - 5 : 0;
  }
}
