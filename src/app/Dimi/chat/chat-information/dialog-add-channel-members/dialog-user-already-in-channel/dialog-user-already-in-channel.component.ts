import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-user-already-in-channel',
  standalone: true,
  imports: [  CommonModule,
    MatDialogModule,
    MatCardModule,],
  templateUrl: './dialog-user-already-in-channel.component.html',
  styleUrl: './dialog-user-already-in-channel.component.scss'
})
export class DialogUserAlreadyInChannelComponent {
  constructor(public dialogRef: MatDialogRef<DialogUserAlreadyInChannelComponent>,){}

  closeDialog() {
    this.dialogRef.close(false);
  }
}
