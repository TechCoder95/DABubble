import { Component, Pipe } from '@angular/core';
import { ChannelService } from '../../../../shared/services/channel.service';
import { map, Observable, pipe } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../shared/services/chat.service';
import { UserService } from '../../../../shared/services/user.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { ChatMessage } from '../../../../shared/interfaces/chatmessage';

@Component({
  selector: 'app-chat-inputfield',
  standalone: true,
  imports: [CommonModule, CommonModule, FormsModule],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
})
export class InputfieldComponent {
  addFilesImg = './img/add-files-default.png';
  addEmojiImg = './img/add-emoji-default.png';
  addLinkImg = './img/add-link-default.png';
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
      this.addFilesImg = './img/add-files-hover.png';
      this.addEmojiImg = './img/add-emoji.png';
      this.addLinkImg = './img/add-link.png';
    } else {
      this.setDefaultImages();
    }
  }

  changeAddEmojiImg(hover: boolean) {
    if (hover) {
      this.addEmojiImg = './img/add-emoji-hover.png';
      this.addFilesImg = './img/add-files.png';
      this.addLinkImg = './img/add-link.png';
    } else {
      this.setDefaultImages();
    }
  }

  changeAddLinkImg(hover: boolean) {
    if (hover) {
      this.addLinkImg = './img/add-link-hover.png';
      this.addEmojiImg = './img/add-emoji.png';
      this.addFilesImg = './img/add-files.png';
    } else {
      this.setDefaultImages();
    }
  }

  setDefaultImages() {
    this.addFilesImg = './img/add-files-default.png';
    this.addEmojiImg = './img/add-emoji-default.png';
    this.addLinkImg = './img/add-link-default.png';
  }

  get placeholderText(): Observable<string> {
    return this.channelService.selectedChannel$.pipe(
      map((channel: any) => `Nachricht an #${channel?.name || 'Channel'}`)
    );
  }

  sendMessage() {
    debugger;
    let message: ChatMessage = {
      channelId: this.channelService.channel.id,
      name: this.channelService.channel.name,
      message: this.textareaValue,
      timestamp: new Date().getTime(),
      sender: this.activeUser.username || 'guest',
      emoticons: [],
    };
    this.chatService.addMessage(message);
    this.textareaValue = '';
  }
}
