import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MemberComponent } from './member/member.component';
import { UserService } from '../../../../shared/services/user.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { ChannelService } from '../../../../shared/services/channel.service';
import { user } from '@angular/fire/auth';
import { DialogAddChannelMembersComponent } from '../dialog-add-channel-members/dialog-add-channel-members.component';

@Component({
  selector: 'app-dialog-channel-members',
  standalone: true,
  imports: [CommonModule, MatCardModule, MemberComponent],
  templateUrl: './dialog-channel-members.component.html',
  styleUrl: './dialog-channel-members.component.scss',
})
export class DialogChannelMembersComponent implements OnInit {
  closeImg = './img/close-default.png';
  addMemberImg = './img/add-members-default.png';
  activeUser!: DABubbleUser;
  channelMembers: DABubbleUser[] = [];
  readonly dialog = inject(MatDialog);

  constructor(
    private userService: UserService,
    public channelService: ChannelService,
    public dialogRef: MatDialogRef<DialogChannelMembersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.activeUser = this.userService.activeUser;
    this.channelService.selectedChannel$.subscribe((channel) => {
      if (channel) {
        channel.assignedUser.forEach((userID) => {
          let user = this.userService.getOneUserbyId(userID);
          if (user && user.id !== this.activeUser.id) {
            this.channelMembers.push(user);
          }
        });
      }
    });
  }

  addMembers() {
    this.closeDialog();
    const dialogAdd = this.dialog.open(DialogAddChannelMembersComponent);

  }

  changeAddMembersImg(hover: boolean) {
    if (hover) {
      this.addMemberImg = './img/add-members-hover.png';
    } else {
      this.addMemberImg = './img/add-members-default.png';
    }
  }

  changeCloseImg(hover: boolean) {
    if (hover) {
      this.closeImg = './img/close-hover.png';
    } else {
      this.closeImg = './img/close-default.png';
    }
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
