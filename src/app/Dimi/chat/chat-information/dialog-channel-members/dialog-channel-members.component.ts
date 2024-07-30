import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MemberComponent } from './member/member.component';
import { UserService } from '../../../../shared/services/user.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { ChannelService } from '../../../../shared/services/channel.service';
import { user } from '@angular/fire/auth';

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

  constructor(
    private userService: UserService,
    public channelService: ChannelService,
    public dialogRef: MatDialogRef<DialogChannelMembersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.activeUser = this.userService.activeUser;
    console.log(this.activeUser);
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
    console.log(this.channelMembers);
    console.log(this.activeUser);
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
