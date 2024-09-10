import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { ChannelService } from '../../../../shared/services/channel.service';
import { UserService } from '../../../../shared/services/user.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { debounceTime } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { TextChannel } from '../../../../shared/interfaces/textchannel';
import { DialogUserAlreadyInChannelComponent } from './dialog-user-already-in-channel/dialog-user-already-in-channel.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-add-channel-members',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    DialogUserAlreadyInChannelComponent,
  ],
  templateUrl: './dialog-add-channel-members.component.html',
  styleUrls: ['./dialog-add-channel-members.component.scss'],
})
export class DialogAddChannelMembersComponent implements AfterViewInit {
  closeImg = './img/close-default.png';
  @ViewChild('inputName') inputName!: ElementRef;
  focusNameInput: boolean = false;
  searchResults: DABubbleUser[] = [];
  selectedUser: DABubbleUser[] = [];
  removeSelectedUserImg = './img/remove-selected-user.svg';
  selectedChannel: TextChannel = JSON.parse(
    sessionStorage.getItem('selectedChannel')!,
  );
  hoverStates: boolean[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogAddChannelMembersComponent>,
    public channelService: ChannelService,
    public userService: UserService,
    public dialog: MatDialog,
    public router: Router,
  ) {}

  /**
   * Lifecycle hook that is called after Angular has fully initialized the component's view.
   * It is used to perform any additional initialization tasks that require the view to be fully rendered.
   */
  ngAfterViewInit(): void {
    setTimeout(() => this.inputName.nativeElement.blur(), 200);
    const keyup$ = fromEvent<KeyboardEvent>(
      this.inputName.nativeElement,
      'keyup',
    ).pipe(debounceTime(500));

    keyup$.subscribe((event: KeyboardEvent) => this.searchUser(event));
  }

  /**
   * Searches for users based on the provided input value, excluding the selected user.
   *
   * @param event - The keyboard event triggered by the user.
   */
  searchUser(event: KeyboardEvent) {
    let inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value.toLowerCase();

    if (inputValue.trim() === '') {
      this.searchResults = [];
      return;
    }

    this.searchResults = [];

    this.userService
      .searchUsersExcludingSelected(inputValue, this.selectedUser)
      .then((results: DABubbleUser[]) => {
        this.searchResults.push(...results);
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
      });
  }

  /**
   * Puts a user into the input field.
   *
   * @param user - The user to be added to the input field.
   */
  putUserToInputfield(user: DABubbleUser) {
    this.searchResults = [];
    this.inputName.nativeElement.value = '';

    if (!this.selectedUser.find((u) => u.id === user.id)) {
      this.selectedUser.push(user);
    } else {
      alert('Benutzer wurde schon zur Auswahl hinzugefügt');
    }
  }

  /**
   * Removes a selected user from the array of selected users.
   *
   * @param index - The index of the user to be removed.
   */
  removeSelectedUser(index: number) {
    this.selectedUser.splice(index, 1);
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
   * Changes the remove selected user image based on the hover state.
   *
   * @param index - The index of the user image.
   * @param hover - The hover state of the user image.
   */
  changeRemoveSelectedUserImg(index: number, hover: boolean) {
    this.hoverStates[index] = hover;
  }

  /**
   * Closes the dialog.
   */
  closeDialog() {
    this.dialogRef.close(false);
  }

  /**
   * Adds users to the selected channel.
   *
   * @param allUser - An array of DABubbleUser objects representing all the users to be added.
   * @returns Promise<void> - A promise that resolves when the users have been added to the channel.
   */
  async addUserToChannel(allUser: DABubbleUser[]) {
    if (this.selectedChannel) {
      let usersToPush: string[] = [];
      for (const user of allUser) {
        if (!this.selectedChannel.assignedUser.includes(user.id!)) {
          usersToPush.push(user.id!);
        } else {
          usersToPush = [];
          this.dialog.open(DialogUserAlreadyInChannelComponent, {
            data: { username: user.username },
          });
          return;
        }
        for (const userId of usersToPush) {
          this.selectedChannel.assignedUser.push(userId);
          await this.channelService.updateChannel(this.selectedChannel);
        }
        this.dialogRef.close();
        await this.router.navigate(['/home']);
        setTimeout(async () => {
          this.router.navigate(['/home/channel', this.selectedChannel.id]);
        }, 0.1);
      }
    }
  }

  windowIsSmall() {
    return window.innerWidth <= 1250;
  }
}
