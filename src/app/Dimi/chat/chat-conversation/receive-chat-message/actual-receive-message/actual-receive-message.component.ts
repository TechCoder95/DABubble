import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { EmojisPipe } from '../../../../../shared/pipes/emojis.pipe';

@Component({
  selector: 'app-actual-receive-message',
  standalone: true,
  imports: [CommonModule, EmojisPipe],
  templateUrl: './actual-receive-message.component.html',
  styleUrl: './actual-receive-message.component.scss',
})
export class ActualReceiveMessageComponent {
  @Input() receiveMessage!: ChatMessage;
  @Input() receivedImgMessage!: string;
  @Input() repeatedMessage!: boolean | undefined;

 /*  getLinkedUserNames(): string[] {
    return this.receiveMessage.linkedUsers.map((username) => `@${username}`);
  } */
}