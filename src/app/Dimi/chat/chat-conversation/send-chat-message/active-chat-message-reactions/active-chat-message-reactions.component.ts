import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { UserService } from '../../../../../shared/services/user.service';
import { DatabaseService } from '../../../../../shared/services/database.service';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { ChatService } from '../../../../../shared/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-active-chat-message-reactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-chat-message-reactions.component.html',
  styleUrl: './active-chat-message-reactions.component.scss',
})
export class ActiveChatMessageReactionsComponent implements OnInit, OnDestroy {
  @Input() sendMessage!: any;
  @Input() user!: DABubbleUser;
  activeUser!: DABubbleUser;
  private emojiSubscription!: Subscription;
  private databaseSubscription!: Subscription;
  allEmojis: Emoji[] = [];
  currentEmoji!: Emoji;

  constructor(
    private userService: UserService,
    private databaseService: DatabaseService,
    private chatService: ChatService
  ) {
    this.activeUser = this.user;
  }

  ngOnInit(): void {
    this.subscribeToEmoji();
  }

  ngOnDestroy(): void {
    if (this.emojiSubscription) {
      this.emojiSubscription.unsubscribe();
    }
  }


  subscribeToEmoji() {
    this.emojiSubscription = this.chatService.sendMessagesEmoji$.subscribe(
      (emoji) => {
        if (emoji) {
          this.allEmojis.push(emoji);
          this.currentEmoji = emoji;
          console.log(this.allEmojis);
        }
      }
    );
  }

}
