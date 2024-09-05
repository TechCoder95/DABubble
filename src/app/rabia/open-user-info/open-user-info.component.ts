import { Component, Inject, inject } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChannelService } from '../../shared/services/channel.service';
import { DABubbleUser } from '../../shared/interfaces/user';
import { RouterModule, Router } from '@angular/router';
import { GlobalsubService } from '../../shared/services/globalsub.service';
import { TextChannel } from '../../shared/interfaces/textchannel';

@Component({
  selector: 'app-open-user-info',
  standalone: true,
  imports: [MatButtonModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './open-user-info.component.html',
  styleUrl: './open-user-info.component.scss',
})
export class OpenUserInfoComponent {
  readonly dialogRef = inject(MatDialogRef<OpenUserInfoComponent>);
  showChatComponent!: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public userService: UserService,
    private channelService: ChannelService,
    private router: Router,
  ) {}

  private subscriptionService = inject(GlobalsubService);

  /**
   * Creates a new message.
   *
   * @returns {Promise<void>} A promise that resolves when the new message is created.
   */
  async newMessage() {
    const user = this.getConvertedDABubbleUser();
    this.userService.setSelectedUser(user);
    const channel: TextChannel | null =
      await this.channelService.findOrCreateChannelByUserID();
    sessionStorage.setItem('selectedChannel', JSON.stringify(channel));
    await this.router.navigate(['/home']);
    setTimeout(async () => {
      this.router.navigate(['home', 'channel', channel!.id]);
    }, 0.1);
    this.subscriptionService.updateActiveChannel(channel!);
    this.dialogRef.close();
  }

  /**
   * Converts the current member data to a DABubbleUser object.
   *
   * @returns The converted DABubbleUser object.
   */
  getConvertedDABubbleUser() {
    const user: DABubbleUser = {
      id: this.data.member.id,
      username: this.data.member.username,
      avatar: this.data.member.avatar,
      mail: this.data.member.mail,
      uid: this.data.member.uid,
      isLoggedIn: this.data.member.isLoggedIn,
    };

    return user;
  }

  /**
   * Closes the dialog.
   */
  close() {
    this.dialogRef.close();
  }
}
