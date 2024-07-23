import { Component, Input } from '@angular/core';
import { DialogChannelMembersComponent } from '../dialog-channel-members.component';
import { OpenUserInfoComponent } from "../../../../../rabia/open-user-info/open-user-info.component";
import { MatDialog } from '@angular/material/dialog';

DialogChannelMembersComponent;

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss',
})
export class MemberComponent {
  @Input() member: any;

  constructor(public dialog: MatDialog) { }

  openInfo() {
    console.log("das ist der: ", this.member);
    this.dialog.open(OpenUserInfoComponent, {
      data: { member: this.member }
    });
  }


}
