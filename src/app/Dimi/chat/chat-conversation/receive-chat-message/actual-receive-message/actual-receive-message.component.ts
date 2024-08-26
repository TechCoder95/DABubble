import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { EmojisPipe } from '../../../../../shared/pipes/emojis.pipe';
import { HtmlConverterPipe } from "../../../../../shared/pipes/html-converter.pipe";
import { VerlinkungPipe } from "../../../../../shared/pipes/verlinkung.pipe";

@Component({
  selector: 'app-actual-receive-message',
  standalone: true,
  imports: [CommonModule, EmojisPipe, HtmlConverterPipe, VerlinkungPipe],
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