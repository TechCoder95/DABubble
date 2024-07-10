import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-information',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-information.component.html',
  styleUrl: './chat-information.component.scss',
})
export class ChatInformationComponent {
  isChannel: boolean = true;
  tagImg = './img/tag.png';
  arrowImg = './img/keyboard_arrow_down.png';
  tagImgClass = '';

  changeTagImg(hover: boolean) {
    if (hover) {
      this.tagImg = './img/tag-hover.png';
      this.arrowImg = './img/arrow-down-hover.png';
    } else {
      this.tagImg = './img/tag.png';
      this.arrowImg = './img/keyboard_arrow_down.png';
    }
  }
}
