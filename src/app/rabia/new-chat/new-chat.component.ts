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

/**
 * @component NewChatComponent
 * @description
 * This component allows the user to start a new chat by searching for users or channels.
 * It includes search functionality and the ability to select either a user or a channel to start a conversation.
 */
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

    /**
   * @constructor
   * @param {UserService} userService - Service for managing user-related operations.
   * @param {ChannelService} channelService - Service for managing channel-related operations.
   */
  constructor(private userService: UserService, private channelService: ChannelService) { }

    /**
   * @public
   * @description Angular lifecycle hook that runs after the component's view has been initialized.
   * Sets up the search functionality with debounce and distinct until changed logic.
   */
  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(async value => {
        if (this.hasSelection) {
          this.hasSelection = false;
          return { users: [], channels: [] };
        }
        return Promise.all([
          await this.userService.searchUsersByNameOrEmail(value),
          await this.channelService.searchChannelsByName(value, this.userService.activeUser.id!)
        ]).then(([users, channels]) => {
          const filteredChannels = channels.filter(channel => !channel.isPrivate);
          return { users, channels: filteredChannels };
        });
      })
    ).subscribe(results => {
      this.searchResults = results;
    });
  }
  
 /**
   * Selects a user and updates the search results to reflect this selection.
   * 
   * @param {DABubbleUser} user - The user selected from the search results.
   */
  selectUser(user: DABubbleUser) {
    this.isSelectingUser = true;
    this.isSelectingChannel = false;
    this.hasSelection = true;
    this.searchQuery = user.username;
    this.searchControl.setValue(user.username);
    this.searchResults = { users: [], channels: [] };
    this.userService.setSelectedUser(user);
  }

   /**
   * Selects a channel and updates the search results to reflect this selection.
   * 
   * @param {TextChannel} channel - The channel selected from the search results.
   */
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
