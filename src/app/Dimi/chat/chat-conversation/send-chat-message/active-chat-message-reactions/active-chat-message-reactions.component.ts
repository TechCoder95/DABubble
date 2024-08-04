import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { UserService } from '../../../../../shared/services/user.service';
import { DatabaseService } from '../../../../../shared/services/database.service';
import { DABubbleUser } from '../../../../../shared/interfaces/user';
import { ChatService } from '../../../../../shared/services/chat.service';
import { Subscription } from 'rxjs';
import { ReactionComponent } from './reaction/reaction.component';

@Component({
  selector: 'app-active-chat-message-reactions',
  standalone: true,
  imports: [CommonModule, ReactionComponent],
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
    /*  this.subscribeToDataChanges(); */
    this.subscribeToEmoji();
  }

  ngOnDestroy(): void {
    if (this.emojiSubscription) {
      this.emojiSubscription.unsubscribe();
    }
  }

  isReactionForCurrentMessage(emoji: Emoji): boolean {
    return emoji.messageId === this.sendMessage.id;
  }

  /* subscribeToDataChanges() {
    this.databaseSubscription = this.databaseService.onDataChange$.subscribe(
      async (message) => {
        this.allEmojis = [];
        await this.chatService.sortEmojis(message);
      }
    );
  } */

  subscribeToEmoji() {
    this.emojiSubscription = this.chatService.sendMessagesEmoji$.subscribe(
      (emoji) => {
        if (emoji) {
          debugger;
          const existingEmojiIndex = this.getExistingEmojiIndex(emoji);
          if (existingEmojiIndex !== -1) {
            this.handleExistingEmoji(emoji, existingEmojiIndex);
          } else {
            this.allEmojis.push(emoji);
          }
          this.currentEmoji = emoji;
          console.log(this.allEmojis);
        }
      }
    );
  }

  getExistingEmojiIndex(emoji: Emoji) {
    return this.allEmojis.findIndex((e) => e.type === emoji.type);
  }

  handleExistingEmoji(newEmoji: Emoji, existingEmojiIndex: number) {
    //Wenn Emoji schon existiert, dann update
    const existingEmoji = this.allEmojis[existingEmojiIndex];
    if (newEmoji.usersIds.length === 0) {
      //Entferne den Emoji, wenn der neue EMoji eine Länge von 0 hat
      this.allEmojis.splice(existingEmojiIndex, 1);
    } else if (existingEmoji.usersIds !== newEmoji.usersIds) {
      //Aktualisiere den Emoji ansonsten
      this.allEmojis[existingEmojiIndex] = newEmoji;
    }
  }

  emojiExists(emoji: Emoji) {
    return this.allEmojis.some((e) => e.type === emoji.type);
  }
}
