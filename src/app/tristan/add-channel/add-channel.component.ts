import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TextChannel } from '../../shared/interfaces/textchannel';

/**
 * @component AddChannelComponent
 * @description
 * This component provides a dialog interface for creating a new channel in the chat application.
 * The user can input the channel's name and description, and then either confirm or cancel the creation.
 */
@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [MatDialogModule, MatFormField, MatLabel, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})

export class AddChannelComponent {
  
  data: TextChannel = {
    id: "",
    name: "",
    description: "",
    owner: "",
    assignedUser: [],
    isPrivate: false

  };

    /**
   * @constructor
   * @param {MatDialogRef<AddChannelComponent>} dialogRef - Reference to the dialog opened to create a new channel.
   */
  constructor(private dialogRef: MatDialogRef<AddChannelComponent>) {
  }

  /**
   * Closes the dialog without saving any data.
   * Called when the user clicks the "No" button.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

   /**
   * Returns the data object representing the new channel.
   * Called when the user clicks the "OK" button to confirm the creation of the channel.
   * 
   * @returns {TextChannel} The data object containing the new channel information.
   */
  onOkClick(): TextChannel {
    return this.data;
  }
}
