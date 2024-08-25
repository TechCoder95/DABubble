import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserService } from '../../shared/services/user.service';
import { DABubbleUser } from '../../shared/interfaces/user';
import { InputfieldComponent } from "../../Dimi/chat/chat-inputfield/inputfield.component";
import { CommonModule } from '@angular/common';
import { MessageType } from '../../shared/enums/messagetype';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { ChannelService } from '../../shared/services/channel.service';

@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatInputModule, InputfieldComponent, FormsModule, CommonModule],
  templateUrl: './new-chat.component.html',
  styleUrls: ['./new-chat.component.scss']
})

export class NewChatComponent implements OnInit {
  searchControl = new FormControl();
  searchResults: { users: DABubbleUser[], channels: TextChannel[] } = { users: [], channels: [] };
  searchQuery: string | undefined;
  isSelectingUser!: boolean;
  isSelectingChannel!: boolean;
  hasSelection: boolean = false;

  messageType: MessageType = MessageType.NewDirect;

  @Input() selectedChannelFromSidenav: any;
  @Input() activeUserFromSidenav: any;

  constructor(private userService: UserService, private channelService: ChannelService) { }

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (this.hasSelection) { 
          this.hasSelection = false;
          return [];
        }
        return Promise.all([
          this.userService.searchUsersByNameOrEmail(value),
          this.channelService.searchChannelsByName(value, this.userService.activeUser.id!)
        ]).then(([users, channels]) => ({ users, channels }));
      })
    ).subscribe(results => {
      this.searchResults = results;
    });
  }

  selectUser(user: DABubbleUser) {
    this.isSelectingUser = true;
    this.isSelectingChannel = false;
    this.hasSelection = true;
    this.searchQuery = user.username;
    this.searchControl.setValue(user.username);
    this.searchResults = { users: [], channels: [] };
    this.userService.setSelectedUser(user);
  }

  selectChannel(channel: TextChannel) {
    this.isSelectingChannel = true;
    this.isSelectingUser = false;
    this.hasSelection = true;
    this.searchQuery = `#${channel.name}`;
    this.searchControl.setValue(`#${channel.name}`);
    this.searchResults = { users: [], channels: [] };
    this.channelService.selectChannel(channel);
  }
}
