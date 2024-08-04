import { Component } from '@angular/core';
import { ThreadEmojiComponent } from "../thread-emoji/thread-emoji.component";
import { ThreadMyEmojiComponent } from "../thread-my-emoji/thread-my-emoji.component";
import AOS from "aos";


@Component({
  selector: 'app-thread-chat',
  standalone: true,
  imports: [ThreadEmojiComponent, ThreadMyEmojiComponent],
  templateUrl: './thread-chat.component.html',
  styleUrl: './thread-chat.component.scss'
})
export class ThreadChatComponent {

}
