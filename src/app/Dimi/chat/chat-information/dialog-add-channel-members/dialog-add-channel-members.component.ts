import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dialog-add-channel-members',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule],
  templateUrl: './dialog-add-channel-members.component.html',
  styleUrl: './dialog-add-channel-members.component.scss',
})
export class DialogAddChannelMembersComponent {
  closeImg = './img/close-default.png';
  constructor(
    public dialogRef: MatDialogRef<DialogAddChannelMembersComponent>
  ) {}

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
