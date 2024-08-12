import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { DatabaseService } from '../../../services/database.service';
import { ChatMessage } from '../../../interfaces/chatmessage';
import { TextChannel } from '../../../interfaces/textchannel';
import { MatDialog } from '@angular/material/dialog';
import { OpenUserInfoComponent } from '../../../../rabia/open-user-info/open-user-info.component';
import { ChannelService } from '../../../services/channel.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.scss'
})
export class SearchbarComponent {

  searchInput: string = '';
  searchResults: any[] = [];
  channels: TextChannel[] = [];
  messages: ChatMessage[] = [];


  constructor(private userService: UserService, private databaseService: DatabaseService, public dialog: MatDialog, private channelService: ChannelService, public router: Router) {

    this.channels = [];
    this.messages = [];

    this.databaseService.getUserChannels(sessionStorage.getItem('userLogin')!).then((channels) => {
      this.channels = channels;
      channels.forEach(channel => {
        this.databaseService.getMessagesByChannel(channel.id).then((messages) => {
          this.messages = this.messages.concat(messages);
        });
      });
    });
  }


  search() {
    this.searchResults = [];
    // this.pushUsers();
    this.pushMessages();
    this.pushChannels();
  }


  // pushUsers() {
  //   this.userService.users.forEach(user => {
  //     if (user.username?.includes(this.searchInput)) {
  //       let searchItem = {
  //         title: 'User: ',
  //         description: user.username,
  //         photo: user.avatar
  //       }
  //       this.searchResults.push(searchItem);
  //     }
  //   });
  // }


  pushChannels() {
    this.channels.forEach(channel => {
      if (channel.name?.includes(this.searchInput)) {
        let searchItem = {
          title: 'Channel: ',
          description: channel.name
        }
        this.searchResults.push(searchItem);
      }
    });
  }


  pushMessages() {
    this.messages.forEach(message => {
      if (message.message?.includes(this.searchInput) && message.deleted === false) {
        let searchItem = {
          title: 'Message: ',
          description: message.message,
          channel: this.channels.find(channel => channel.id === message.channelId)?.name,
          id: message.id
        }
        this.searchResults.push(searchItem);
      }
    });
  }


  openProfile(profileUsername: string) {
    // this.users.forEach(user => {
    //   if (user.username === profileUsername) {
    //     this.openInfo(user);
    //   }
    // }
    // );
  }


  openInfo(user: any) {
    this.dialog.open(OpenUserInfoComponent, {
      data: { member: user },
    });

    this.resetInput();
  }


  openChannel(channelName: string) {
    this.channels.forEach(channel => {
      if (channel.name === channelName) {
        this.channelService.selectChannel(channel);
      }
    });
    this.resetInput();
  }


  scrollToMessage(messageId: string) {
    let message = this.messages.find(message => message.id === messageId);
    let x = message as unknown as ChatMessage;
    this.openChannel(x.channelName!);
    if (x.id === messageId) {
      document.getElementById(x.id!)?.scrollIntoView()
      setTimeout(() => {
        document.getElementById(x.id!)!.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
      }, 1000);
      setTimeout(() => {
        document.getElementById(x.id!)!.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        this.resetInput();
      }, 2000);
    }

  }

  resetInput() {
    this.searchInput = '';
  }
}
