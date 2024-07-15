import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MemberComponent } from './member/member.component';

@Component({
  selector: 'app-dialog-channel-members',
  standalone: true,
  imports: [CommonModule, MatCardModule, MemberComponent],
  templateUrl: './dialog-channel-members.component.html',
  styleUrl: './dialog-channel-members.component.scss',
})
export class DialogChannelMembersComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogChannelMembersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  closeImg = './img/close-default.png';
  addMemberImg = './img/add-members-default.png';

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
