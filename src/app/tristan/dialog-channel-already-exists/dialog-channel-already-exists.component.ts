import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { TextChannel } from '../../shared/interfaces/textchannel';

@Component({
  selector: 'app-dialog-channel-already-exists',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule],
  templateUrl: './dialog-channel-already-exists.component.html',
  styleUrl: './dialog-channel-already-exists.component.scss'
})
export class DialogChannelAlreadyExistsComponent {
  channel: TextChannel | undefined;

  constructor(public dialogRef: MatDialogRef<DialogChannelAlreadyExistsComponent>, @Inject(MAT_DIALOG_DATA) public channelData: TextChannel,) {
    this.channel = channelData;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
