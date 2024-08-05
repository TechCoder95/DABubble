import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { DatabaseService } from '../../../services/database.service';
import { ChatMessage } from '../../../interfaces/chatmessage';
import { TextChannel } from '../../../interfaces/textchannel';

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



  constructor(private userService: UserService, private databaseService: DatabaseService) {

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
          description: user.username
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
    }
    );
  }
  

  pushMessages() {
    this.messages.forEach(message => {
      if (message.message?.includes(this.searchInput) && message.deleted === false) {
        let searchItem = {
          title: 'Message: ',
          description: message.message
        }
        this.searchResults.push(searchItem);
      }
    });
  }

}
