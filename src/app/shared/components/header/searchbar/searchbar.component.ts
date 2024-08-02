import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { ChannelService } from '../../../services/channel.service';
import { ChatService } from '../../../services/chat.service';

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

  constructor(private userService:UserService, private channelService:ChannelService, private chatService : ChatService) { }

  search() {
    console.log('searching for: ' + this.searchInput);
    this.searchResults = [];
    this.userService.users.forEach(user => {
      if (user.username?.includes(this.searchInput)) {
        let searchItem = {
          title: 'User: ',
          description: user.username
        }
        this.searchResults.push(searchItem);
      }
    });

    // Todo: Die Suche für die Channel und die Messages muss noch eingebaut werden!


    // this.channelService.channel.forEach(channel => {
    //   if (channel.name?.includes(this.searchInput)) {
    //     let searchItem = {
    //       title: channel.name,
    //     }
    //     this.searchResults.push(searchItem);
    //   }
    // });

    // this.chatService..forEach(message => {
    //   if (message.content?.includes(this.searchInput)) {
    //     let searchItem = {
    //       title: message.content,
    //     }
    //     this.searchResults.push(searchItem);
    //   }
    // }


  }




}
