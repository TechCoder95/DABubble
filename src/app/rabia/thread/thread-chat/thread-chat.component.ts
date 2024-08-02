import { Component } from '@angular/core';
import { ThreadEmojiComponent } from "../thread-emoji/thread-emoji.component";

@Component({
  selector: 'app-thread-chat',
  standalone: true,
  imports: [ThreadEmojiComponent],
  templateUrl: './thread-chat.component.html',
  styleUrl: './thread-chat.component.scss'
})
export class ThreadChatComponent {

}
