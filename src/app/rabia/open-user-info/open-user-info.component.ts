import { Component, Inject, inject, Input } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChannelService } from '../../shared/services/channel.service';
import { DABubbleUser } from '../../shared/interfaces/user';
import { RouterModule, Router } from '@angular/router';


@Component({
  selector: 'app-open-user-info',
  standalone: true,
  imports: [MatButtonModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './open-user-info.component.html',
  styleUrl: './open-user-info.component.scss'
})
export class OpenUserInfoComponent {

  readonly dialogRef = inject(MatDialogRef<OpenUserInfoComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public userService: UserService, private channelService: ChannelService, private router: Router) {

  }
  // todo
 async newMessage() {    
    this.userService.setSelectedUser(this.getConvertedDABubbleUser());
    const channel = await this.channelService.findOrCreateChannel();
    console.log("mein channel: ", channel);
   await this.router.navigate(['/home/channel/' + channel?.id]);
  }

  getConvertedDABubbleUser(){
    const user: DABubbleUser = {
      id: this.data.member.id,
      username: this.data.member.username,
      avatar: this.data.member.avatar,
      mail: this.data.member.mail,
      uid: this.data.member.uid,
      isLoggedIn: this.data.member.isLoggedIn
    };

    return user;
  }
   
  

  close() {
    this.dialogRef.close();
  }
}