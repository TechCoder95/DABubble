import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { DatabaseService } from '../../../services/database.service';
import { ChatMessage } from '../../../interfaces/chatmessage';
import { TextChannel } from '../../../interfaces/textchannel';
import { MatDialog } from '@angular/material/dialog';
import { OpenUserInfoComponent } from '../../../../rabia/open-user-info/open-user-info.component';
import { ChannelService } from '../../../services/channel.service';
import { Router } from '@angular/router';
import { DABubbleUser } from '../../../interfaces/user';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface SearchResult {
  title: string;
  description: any;
}

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.scss',
})
export class SearchbarComponent implements OnInit {
  private databaseService = inject(DatabaseService);
  private userService = inject(UserService);
  private channelService = inject(ChannelService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  searchInput: string = '';
  searchResults: SearchResult[] = [];
  userSearch: DABubbleUser[] = [];
  channelSearch: TextChannel[] = [];
  messageSearch: ChatMessage[] = [];

  private searchSubject: Subject<string> = new Subject();

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), // 300ms debounce time
      )
      .subscribe((searchText) => {
        this.searchInput = searchText;
        this.searchItems();
      });

    this.databaseService
      .readDataByArray(
        'channels',
        'assignedUser',
        JSON.parse(sessionStorage.getItem('userLogin')!).id,
      )
      .then((results: TextChannel[]) => {
        this.channelSearch = results;
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
      });
  }

  /**
   * Handles the change event of the search input.
   *
   * @param searchText - The text entered in the search input.
   */
  onSearchInputChange(searchText: string) {
    if (searchText === '') {
      this.searchResults = [];
      return;
    } else if (this.searchResults.length === 1) {
      return;
    } else {
      this.searchSubject.next(searchText);
    }
  }

  /**
   * Handles the key press event for the Enter key.
   *
   * @param event - The keyboard event object.
   */
  handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearchInputChange(this.searchInput);
    }
  }

  /**
   * Searches for items and updates the search results.
   */
  searchItems() {
    this.searchResults = [];
    this.pushUsers();
    this.pushMessages();
    this.pushChannels();
  }

  /**
   * Pushes users to the search results.
   */
  pushUsers() {
    this.userService
      .searchUsersByNameOrEmail(this.searchInput)
      .then((results: DABubbleUser[]) => {
        results.forEach((user) => {
          let searchItem = {
            title: 'User: ',
            description: user,
          };
          this.searchResults.push(searchItem);
        });
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
      });
  }

  /**
   * Pushes the filtered channel search results to the search results array.
   */
  pushChannels() {
    const newResults = this.channelSearch.filter((channel) =>
      channel.name.includes(this.searchInput),
    );
    newResults.forEach((channel) => {
      let searchItem = {
        title: 'Channel: ',
        description: channel,
      };
      this.searchResults.push(searchItem);
    });
  }

  /**
   * Pushes the messages that match the search input to the search results array.
   *
   * @remarks
   * This method iterates over the `channelSearch` array and retrieves the messages from the database that have a matching `channelId`.
   * It then filters the retrieved messages based on the `searchInput` and adds the matching messages to the `searchResults` array.
   *
   * @returns void
   */
  pushMessages() {
    this.channelSearch.forEach((channel) => {
      this.databaseService
        .readDataByField('messages', 'channelId', channel.id)
        .then((messages: ChatMessage[]) => {
          const newResults = messages.filter((message) =>
            message.message
              .toString()
              .toLowerCase()
              .includes(this.searchInput.toLowerCase()),
          );
          newResults.forEach((message) => {
            let searchItem = {
              title: 'Message: ',
              description: message,
            };
            this.searchResults.push(searchItem);
          });
        })
        .catch((error) => {
          console.error('Error fetching search results:', error);
        });
    });
  }

  /**
   * Opens the user information dialog.
   *
   * @param user - The user object.
   */
  openInfo(user: any) {
    this.dialog.open(OpenUserInfoComponent, {
      data: { member: user },
    });

    this.resetInput();
  }

  /**
   * Opens a channel and performs necessary actions.
   *
   * @param channel - The channel to be opened.
   */
  openChannel(channel: TextChannel) {
    this.channelService.selectChannel(channel);
    this.router.navigate(['/home']);
    setTimeout(() => {
      this.router.navigate(['/home/channel', channel.id]);
    }, 0.1);
    this.resetInput();
  }

  /**
   * Scrolls to the message with the specified messageId.
   *
   * @param messageId - The id of the message to scroll to.
   */
  scrollToMessage(messageId: string) {
    let message = this.messageSearch.find(
      (message) => message.id === messageId,
    );
    let x = message as unknown as ChatMessage;
    if (x.id === messageId) {
      document.getElementById(x.id!)?.scrollIntoView();
      setTimeout(() => {
        document.getElementById(x.id!)!.style.backgroundColor =
          'rgba(0, 0, 0, 0.1)';
      }, 1000);
      setTimeout(() => {
        document.getElementById(x.id!)!.style.backgroundColor =
          'rgba(0, 0, 0, 0)';
        this.resetInput();
      }, 2000);
    }
  }

  /**
   * Resets the search input value.
   */
  resetInput() {
    this.searchInput = '';
  }
}
