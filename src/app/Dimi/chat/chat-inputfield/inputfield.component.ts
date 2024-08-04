import { Component, Pipe } from '@angular/core';
import { ChannelService } from '../../../shared/services/channel.service';
import { map, Observable, pipe, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../shared/services/chat.service';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { DatabaseService } from '../../../shared/services/database.service';
import { TextChannel } from '../../../shared/interfaces/textchannel';

@Component({
  selector: 'app-chat-inputfield',
  standalone: true,
  imports: [CommonModule, CommonModule, FormsModule],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
})
export class InputfieldComponent {
  addFilesImg = './img/add-files-default.svg';
  addEmojiImg = './img/add-emoji-default.svg';
  addLinkImg = './img/add-link-default.svg';
  textareaValue: string = '';
  activeUser!: DABubbleUser;
  selectedChannel: TextChannel | null = null;

  constructor(
    public channelService: ChannelService,
    private chatService: ChatService,
    private userService: UserService,
    private databaseService: DatabaseService
  ) {
    this.activeUser = this.userService.activeUser;
    this.channelService.selectedChannel$.subscribe(channel => {
      this.selectedChannel = channel;
    });
  }

  changeAddFilesImg(hover: boolean) {
    if (hover) {
      this.addFilesImg = './img/add-files-hover.svg';
      this.addEmojiImg = './img/add-emoji.svg';
      this.addLinkImg = './img/add-link.svg';
    } else {
      this.setDefaultImages();
    }
  }

  changeAddEmojiImg(hover: boolean) {
    if (hover) {
      this.addEmojiImg = './img/add-emoji-hover.svg';
      this.addFilesImg = './img/add-files.svg';
      this.addLinkImg = './img/add-link.svg';
    } else {
      this.setDefaultImages();
    }
  }

  changeAddLinkImg(hover: boolean) {
    if (hover) {
      this.addLinkImg = './img/add-link-hover.svg';
      this.addEmojiImg = './img/add-emoji.svg';
      this.addFilesImg = './img/add-files.svg';
    } else {
      this.setDefaultImages();
    }
  }

  setDefaultImages() {
    this.addFilesImg = './img/add-files-default.svg';
    this.addEmojiImg = './img/add-emoji-default.svg';
    this.addLinkImg = './img/add-link-default.svg';
  }

  get placeholderText(): Observable<string> {
    return this.channelService.selectedChannel$.pipe(
      map((channel: any) => `Nachricht an #${channel?.name || 'Channel'}`)
    );
  }

  async sendMessage() {
    let selectedUser = this.userService.getSelectedUser();
    if (selectedUser) {
      const channel = await this.channelService.createDirectChannelIfNotExists(selectedUser);
      this.channelService.selectChannel(channel);
      this.selectedChannel = channel;
    }

    if (this.selectedChannel) {
      let message: ChatMessage = {
        channelId: this.selectedChannel.id,
        channelName: this.selectedChannel.name,
        message: this.textareaValue,
        timestamp: new Date().getTime(),
        senderName: this.activeUser.username || 'guest',
        senderId: this.activeUser.id || 'senderIdDefault',
        emoticons: [],
        edited: false,
        deleted: false,
      };

      if (message.message !== '') {
        try {
          const newMessageId = await this.databaseService.addChannelDataToDB('messages', message);
          message.id = newMessageId;
          this.chatService.sendMessage(message);
          this.textareaValue = '';
        } catch (error) {
          console.error('Fehler beim Senden der Nachricht:', error);
        }
      } else {
        alert('Du musst eine Nachricht eingeben');
      }
    } else {
      console.error('Kein Channel ausgewählt');
    }
  }
}
