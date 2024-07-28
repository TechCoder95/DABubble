import { Component, Input } from '@angular/core';
import { DialogChannelMembersComponent } from '../dialog-channel-members.component';
import { OpenUserInfoComponent } from "../../../../../rabia/open-user-info/open-user-info.component";
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';


DialogChannelMembersComponent;

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss',
})
export class MemberComponent {
  @Input() allUsers: any;
  online: boolean = false;

  constructor(public dialog: MatDialog) { }

  openInfo() {
    console.log("das ist der: ", this.allUsers);
    this.dialog.open(OpenUserInfoComponent, {
      data: { member: this.allUsers }
    });
  }


}
