import { Component, Input, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DialogChannelMembersComponent } from '../dialog-channel-members.component';
import { OpenUserInfoComponent } from '../../../../../rabia/open-user-info/open-user-info.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { UserService } from '../../../../../shared/services/user.service';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { GlobalsubService } from '../../../../../shared/services/globalsub.service';

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
  @Input({required:true}) member!: DABubbleUser;
  isLoggedIn: boolean | undefined;
  private userSubscription: Subscription | undefined;

  constructor(public dialog: MatDialog, private userService: UserService,private subService: GlobalsubService) {
   
  }

  ngOnInit(): void {
    this.activeUser = this.userService.activeUser;
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
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
