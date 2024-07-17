import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-inputfield',
  standalone: true,
  imports: [],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
})
export class InputfieldComponent {
  addFilesImg = './img/add-files-default.png';
  addEmojiImg = './img/add-emoji-default.png';
  addLinkImg = './img/add-link-default.png';

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
}
