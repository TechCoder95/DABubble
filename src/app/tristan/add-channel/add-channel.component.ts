import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { AddMemberToChannelComponent } from './add-member-to-channel/add-member-to-channel.component';
import { ChannelService } from '../../shared/services/channel.service';
import { DialogChannelAlreadyExistsComponent } from '../dialog-channel-already-exists/dialog-channel-already-exists.component';

/**
 * @component AddChannelComponent
 * @description
 * This component provides a dialog interface for creating a new channel in the chat application.
 * The user can input the channel's name and description, and then either confirm or cancel the creation.
 */
@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormField,
    MatLabel,
    FormsModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent {
  channel: TextChannel = {
    id: '',
    name: '',
    description: '',
    owner: '',
    assignedUser: [],
    isPrivate: false,
  };

  readonly newDialog = inject(MatDialog);

  /**
   * @constructor
   * @param {MatDialogRef<AddChannelComponent>} dialogRef - Reference to the dialog opened to create a new channel.
   */
  constructor(private dialogRef: MatDialogRef<AddChannelComponent>, public channelService: ChannelService, private dialog: MatDialog) { }

  /**
   * Closes the dialog without saving any data.
   * Called when the user clicks the "No" button.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  async onCreateClick() {
    const nameExists = await this.channelService.doesChannelNameAlreadyExist(this.channel.name);
    if (nameExists) {
      this.dialog.open(DialogChannelAlreadyExistsComponent, { data: this.channel });
      return;
    }

    const newDialogRef = this.newDialog.open(AddMemberToChannelComponent, {
      data: this.channel,
      panelClass: 'custom-dialog-container',
    });

    newDialogRef.afterClosed().subscribe((channel: TextChannel | undefined) => {
      if (channel) {
        this.dialogRef.close(channel);
      }
    });
  }
}
