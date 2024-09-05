import {
  Component,
  ElementRef,
  Inject,
  inject,
  Input,
  input,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, fromEvent, switchMap } from 'rxjs';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-add-member-to-channel',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormField,
    MatLabel,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-member-to-channel.component.html',
  styleUrl: './add-member-to-channel.component.scss',
})
export class AddMemberToChannelComponent {
  selectedOption: string = '1';
  @ViewChild('inputName') inputName!: ElementRef;
  searchResults: DABubbleUser[] = [];
  selectedUser: DABubbleUser[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddMemberToChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public channel: TextChannel,
    public channelService: ChannelService,
    public userService: UserService,
    public dialog: MatDialog,
  ) {
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inputName.nativeElement.blur(), 200);
    const keyup$ = fromEvent<KeyboardEvent>(
      this.inputName.nativeElement,
      'keyup',
    ).pipe(debounceTime(500));

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
      .searchUsersExcludingSelected(inputValue, this.selectedUser)
      .then((results: DABubbleUser[]) => {
        this.searchResults.push(...results);
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
      });
  }

  async onCreateClick() {
    if (this.selectedOption === '1') {
      const users: DABubbleUser[] = await this.userService.getAllUsersFromDB();
      this.channel.assignedUser = users.map((user) => user.id!);
    } else if (this.selectedOption === '2') {
      const activeUserId = this.userService.activeUser.id!;
      this.channel.assignedUser = [
        activeUserId,
        ...this.selectedUser.map((user) => user.id!),
      ];
    }

    this.dialogRef.close(this.channel);
  }

  putUserToInputfield(user: DABubbleUser) {
    this.searchResults = [];
    this.inputName.nativeElement.value = '';

    if (!this.selectedUser.find((u) => u.id === user.id)) {
      this.selectedUser.push(user);
    } else {
      alert('Benutzer wurde schon zur Auswahl hinzugefügt');
    }
  }

  hoverStates: boolean[] = [];
  changeRemoveSelectedUserImg(index: number, hover: boolean) {
    this.hoverStates[index] = hover;
  }

  removeSelectedUser(index: number) {
    this.selectedUser.splice(index, 1);
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
