import { Component, Pipe } from '@angular/core';
import { ChannelService } from '../../../shared/services/channel.service';
import { map, Observable, pipe } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../shared/services/chat.service';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';

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

  constructor(
    public channelService: ChannelService,
    private chatService: ChatService,
    private userService: UserService
  ) {
    this.activeUser = this.userService.activeUser;
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

  sendMessage() {
    let message: ChatMessage = {
      channelId: this.channelService.channel.id,
      name: this.channelService.channel.name,
      message: this.textareaValue,
      timestamp: new Date().getTime(),
      sender: this.activeUser.username || 'guest',
      emoticons: [],
    };
    this.chatService.sendMessage(message);
    this.textareaValue = '';
  }
}
