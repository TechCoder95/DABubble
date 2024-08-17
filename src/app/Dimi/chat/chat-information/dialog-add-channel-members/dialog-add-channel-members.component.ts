import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { ChannelService } from '../../../../shared/services/channel.service';
import { UserService } from '../../../../shared/services/user.service';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { firstValueFrom, fromEvent, Subject } from 'rxjs';
import { TextChannel } from '../../../../shared/interfaces/textchannel';

@Component({
  selector: 'app-dialog-add-channel-members',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
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
  selectedChannel: TextChannel = JSON.parse(sessionStorage.getItem('selectedChannel')!);

  constructor(
    public dialogRef: MatDialogRef<DialogAddChannelMembersComponent>,
    public channelService: ChannelService,
    public userService: UserService
  ) {

  }

  
  ngAfterViewInit(): void {
    setTimeout(() => this.inputName.nativeElement.blur(), 200);
    const keyup$ = fromEvent<KeyboardEvent>(
      this.inputName.nativeElement,
      'keyup'
    ).pipe(
      debounceTime(500)
    );

    keyup$.subscribe((event: KeyboardEvent) => this.searchUser(event));
  }

  searchUser(event: KeyboardEvent) {
    let inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value.toLowerCase();

    if (inputValue.trim() === '') {
      this.searchResults = [];
      return;
    }

    this.searchResults = [];

    this.userService
      .searchUsersByNameOrEmail(inputValue)
      .then((results: DABubbleUser[]) => {
        this.searchResults.push(...results);
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
      });
  }

  putUserToInputfield(user: DABubbleUser) {
    this.searchResults = [];
    this.inputName.nativeElement.value = '';
    this.inputName.nativeElement.placeholder = '';
    this.selectedUser.push(user);
  }

  removeSelectedUser() {
    this.selectedUser = [];
    this.inputName.nativeElement.placeholder = 'Name eingeben';
  }

  changeCloseImg(hover: boolean) {
    if (hover) {
      this.closeImg = './img/close-hover.png';
    } else {
      this.closeImg = './img/close-default.png';
    }
  }

  changeRemoveSelectedUserImg(hover: boolean) {
    if (hover) {
      this.removeSelectedUserImg = './img/remove-selected-user-hover.svg';
    } else {
      this.removeSelectedUserImg = './img/remove-selected-user.svg';
    }
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  async addUserToChannel(user: DABubbleUser) {
    if (this.selectedChannel) {
      if (!this.selectedChannel.assignedUser.includes(user.id!)) {
        this.selectedChannel.assignedUser.push(user.id!);
        await this.channelService.updateChannel(this.selectedChannel);
       this.closeDialog();
      } else {
        alert('Sorry, User gibt es schon hier im channel');
      }
    }
  }
}
