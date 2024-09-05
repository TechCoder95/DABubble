import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-user-already-in-channel',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule],
  templateUrl: './dialog-user-already-in-channel.component.html',
  styleUrl: './dialog-user-already-in-channel.component.scss',
})
export class DialogUserAlreadyInChannelComponent {
  /* constructor(public dialogRef: MatDialogRef<DialogUserAlreadyInChannelComponent>,){} */
  username: string;

  constructor(
    public dialogRef: MatDialogRef<DialogUserAlreadyInChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.username = data.username;
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
