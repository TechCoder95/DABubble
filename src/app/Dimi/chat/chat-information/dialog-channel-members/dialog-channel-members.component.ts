import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MemberComponent } from './member/member.component';
import { UserService } from '../../../../shared/services/user.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { ChannelService } from '../../../../shared/services/channel.service';
import { DialogAddChannelMembersComponent } from '../dialog-add-channel-members/dialog-add-channel-members.component';
import { GlobalsubService } from '../../../../shared/services/globalsub.service';
import { DatabaseService } from '../../../../shared/services/database.service';

@Component({
  selector: 'app-dialog-channel-members',
  standalone: true,
  imports: [CommonModule, MatCardModule, MemberComponent],
  templateUrl: './dialog-channel-members.component.html',
  styleUrl: './dialog-channel-members.component.scss',
})
export class DialogChannelMembersComponent implements OnInit {
  closeImg = './img/close-default.png';
  addMemberImg = './img/add-members-default.png';
  activeUser!: DABubbleUser;
  channelMembers: DABubbleUser[] = [];
  @Input() isMobileAndInChannelInformation!: boolean;
  displayCloseImg!: boolean;

  readonly dialog = inject(MatDialog);
  @ViewChild('relativeElement', { static: true }) relativeElement!: ElementRef;

  constructor(
    private userService: UserService,
    public channelService: ChannelService,
    private databaseService: DatabaseService,
    public dialogRef: MatDialogRef<DialogChannelMembersComponent>,
    private subService: GlobalsubService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.isMobileAndInChannelInformation = data.isMobileAndInChannelInformation;
    if (!this.isMobileAndInChannelInformation) {
      this.displayCloseImg = false;
    } else {
      this.displayCloseImg = true;
    }
  }

  async ngOnInit() {
    this.activeUser = this.userService.activeUser;
    this.activeUser.isLoggedIn = true;
    JSON.parse(sessionStorage.getItem('selectedChannel')!).assignedUser.forEach(
      (userID: string) => {
        this.databaseService
          .readDataByField('users', 'id', userID)
          .then((user) => {
            user.forEach((x: DABubbleUser) => {
              if (x && x.id !== this.activeUser.id) {
                this.channelMembers.push(x);
              }
            });
          });
      },
    );
    await this.addChannelMembers();
  }

  /**
   * Adds channel members to the current active channel.
   *
   * @returns {Promise<void>} A promise that resolves when the channel members are added.
   */
  async addChannelMembers() {
    this.subService.getActiveChannelObservable().subscribe((channel) => {
      if (channel) {
        this.channelMembers = [];
        channel.assignedUser.forEach((userID) => {
          this.userService.getOneUserbyId(userID).then((user) => {
            let x = user as DABubbleUser;
            if (x && x.id !== this.activeUser.id) {
              this.channelMembers.push(x);
            }
          });
        });
      }
    });
  }

  /**
   * Opens a dialog to add channel members.
   *
   * @remarks
   * This method closes the current dialog and opens a new dialog to add channel members.
   * The position of the new dialog is calculated based on the position of the relative element.
   */
   addMembers() {
    this.closeDialog();
    const rect = this.relativeElement.nativeElement.getBoundingClientRect();
    let dialogWidth!: number;

    if (window.innerWidth >= 1250) {
      dialogWidth = 542;
      this.dialog.open(DialogAddChannelMembersComponent, {
        position: {
          top: `${rect.top + window.scrollY}px`,
          left: `${rect.right - dialogWidth + 100}px`,
        },
      });
    } else if (this.isMobileAndInChannelInformation) {
      dialogWidth = 280;
      this.dialog.open(DialogAddChannelMembersComponent, {
        position: {
          top: `${rect.top + window.scrollY - 220}px`,
          left: `${rect.right - dialogWidth - 20}px`,
        },
      });
    } else {
      dialogWidth = 280;
      this.dialog.open(DialogAddChannelMembersComponent, {
        position: {
          top: `${rect.top + window.scrollY}px`,
          left: `${rect.right - dialogWidth}px`,
        },
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (window.innerWidth >= 1250) {
      this.closeDialog();
    }
  }

  /**
   * Changes the image of the add members button based on the hover state.
   *
   * @param hover - A boolean indicating whether the button is being hovered over or not.
   */
  changeAddMembersImg(hover: boolean) {
    if (hover) {
      this.addMemberImg = './img/add-members-hover.png';
    } else {
      this.addMemberImg = './img/add-members-default.png';
    }
  }

  /**
   * Changes the close image based on the hover state.
   *
   * @param hover - A boolean indicating whether the mouse is hovering over the image.
   */
  changeCloseImg(hover: boolean) {
    if (hover) {
      this.closeImg = './img/close-hover.png';
    } else {
      this.closeImg = './img/close-default.png';
    }
  }

  /**
   * Closes the dialog.
   */
  closeDialog() {
    this.dialogRef.close(false);
  }
}
