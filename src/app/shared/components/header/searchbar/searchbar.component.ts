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
    this.pushUsers();
    this.pushMessages();
    this.pushChannels();
  }


  pushUsers() {
    this.userService.users.forEach(user => {
      if (user.username?.includes(this.searchInput)) {
        let searchItem = {
          title: 'User: ',
          description: user.username,
          photo: user.avatar
        }
        this.searchResults.push(searchItem);
      }
    });
  }


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
    this.userService.users.forEach(user => {
      if (user.username === profileUsername) {
        this.openInfo(user);
      }
    }
    );
  }


  openInfo(user: any) {
    this.dialog.open(OpenUserInfoComponent, {
      data: { member: user },
    });
  }


  openChannel(channelName: string) {
    this.channels.forEach(channel => {
      if (channel.name === channelName) {
        this.channelService.selectChannel(channel);
      }
    }
    );
  }

  scrollToMessage(messageId: string) {
    this.messages.forEach(message => {
      this.openChannel(message.channelName!);
      if (message.id === messageId) {
        setTimeout(() => {
          document.getElementById(message.id!)?.scrollIntoView()
          setTimeout(() => {
            document.getElementById(message.id!)!.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
          }, 1000);
          setTimeout(() => {
            document.getElementById(message.id!)!.style.backgroundColor = 'rgba(0, 0, 0, 0)';
          }, 2000);
        }, 500);
      }
    });
  }

}
