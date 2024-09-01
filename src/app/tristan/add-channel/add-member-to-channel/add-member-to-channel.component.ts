import { Component, Inject, inject, Input, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-add-member-to-channel',
  standalone: true,
  imports: [MatDialogModule, MatFormField, MatLabel, FormsModule, MatInputModule, MatButtonModule, MatRadioModule, CommonModule, ReactiveFormsModule],
  templateUrl: './add-member-to-channel.component.html',
  styleUrl: './add-member-to-channel.component.scss'
})
export class AddMemberToChannelComponent {

  searchControl = new FormControl();
  selectedOption: string = '1';
  searchResults: { users: DABubbleUser[] } = { users: [] };
  searchQuery: string | undefined;
  hasSelection: boolean = false;
  selectedUsers: DABubbleUser[] = [];


  constructor(
    public dialogRef: MatDialogRef<AddMemberToChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public channel: TextChannel,
    private channelService: ChannelService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(async value => await this.performSearch(value))
    ).subscribe(results => {
      this.searchResults = results;
    });
  }

  private async performSearch(value: string): Promise<{ users: DABubbleUser[] }> {
    if (this.hasSelection) {
      this.hasSelection = false;
      return { users: [] };
    }
    const [users] = await Promise.all([
      this.userService.searchUsersByNameOrEmail(value),
      this.channelService.searchChannelsByName(value, this.userService.activeUser.id!)
    ]);
    return { users };
  }

  selectUser(user: DABubbleUser) {
    this.selectedUsers.push(user);
  }

  async onCreateClick() {
    if (this.selectedOption === '1') {
      const users: DABubbleUser[] = await this.userService.getAllUsersFromDB();
      this.channel.assignedUser = users.map(user => user.id!);
    } else if (this.selectedOption === '2') {
      const activeUserId = this.userService.activeUser.id!;
      this.channel.assignedUser = [activeUserId, ...this.selectedUsers.map(user => user.id!)];
    }

    this.dialogRef.close(this.channel);
  }


}
