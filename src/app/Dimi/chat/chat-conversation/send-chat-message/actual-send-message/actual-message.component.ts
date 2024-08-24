import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { EmojisPipe } from '../../../../../shared/pipes/emojis.pipe';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { DAStorageService } from '../../../../../shared/services/dastorage.service';

@Component({
  selector: 'app-actual-message',
  standalone: true,
  imports: [CommonModule, EmojisPipe],
  templateUrl: './actual-message.component.html',
  styleUrl: './actual-message.component.scss',
})
export class ActualMessageComponent {
  @Input() sendMessage!: ChatMessage;
  @Input() sentImage!: string;


  sentImageExists() {
    return this.sendMessage.imageUrl && this.sendMessage.imageUrl.trim() !== '';
  }

  /* getLinkedUserNames(): string[] {
    return this.sendMessage.linkedUsers.map((user) => `@${user.username}`);
  } */
}
