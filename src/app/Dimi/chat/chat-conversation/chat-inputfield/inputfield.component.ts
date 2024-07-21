import { Component, Pipe } from '@angular/core';
import { ChannelService } from '../../../../shared/services/channel.service';
import { map, Observable, pipe } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../shared/services/chat.service';

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

  constructor(
    public channelService: ChannelService,
    private chatService: ChatService
  ) {}

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
    this.chatService.changeMessage(this.textareaValue);
    this.textareaValue = '';
  }
}
