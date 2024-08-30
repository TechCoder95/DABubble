import { Component, Input, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DialogChannelMembersComponent } from '../dialog-channel-members.component';
import { OpenUserInfoComponent } from '../../../../../rabia/open-user-info/open-user-info.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { UserService } from '../../../../../shared/services/user.service';
import { Subscription, takeUntil } from 'rxjs';
import { GlobalsubService, OnlineStatus } from '../../../../../shared/services/globalsub.service';
import { DatabaseService } from '../../../../../shared/services/database.service';

DialogChannelMembersComponent;

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberComponent implements OnDestroy {
  activeUser!: DABubbleUser;
  @Input({ required: true }) member!: DABubbleUser;
  isLoggedIn: boolean | undefined;
  private userSubscription: Subscription | undefined;
  private onlineSub: Subscription | undefined

  constructor(public dialog: MatDialog, private userService: UserService, private subService: GlobalsubService, private databaseService: DatabaseService) {

  }

  ngOnInit(): void {
    this.activeUser = this.userService.activeUser;
    
    this.databaseService.readDataByArray('onlinestatus','onlineUser',this.activeUser.id!).then((data) => {
      this.member.isLoggedIn = data[0].onlineUser.includes(this.member.id!);
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.onlineSub) {
      this.onlineSub.unsubscribe();
    }
  }

  getUserName() {
    if (this.member === this.activeUser) {
      return this.activeUser.username + ' (du)';
    } else {
      return this.member.username;
    }
  }

  openInfo() {
    this.dialog.open(OpenUserInfoComponent, {
      data: { member: this.member },
    });
  }
}
