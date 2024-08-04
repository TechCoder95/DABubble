import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Emoji } from '../../../../shared/interfaces/emoji';
import { UserService } from '../../../../shared/services/user.service';
import { DatabaseService } from '../../../../shared/services/database.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { ChatService } from '../../../../shared/services/chat.service';
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
    this.loadEmojis();
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

  loadEmojis() {
    const emojisOnMessage = this.sendMessage.emoticons;
    emojisOnMessage.forEach(async (emojiID: string) => {
      const emoji: any = await this.databaseService.readDataByID(
        'emojies',
        emojiID
      );
      this.allEmojis.push(emoji);
    });
  }

  subscribeToEmoji() {
    this.emojiSubscription = this.chatService.sendMessagesEmoji$.subscribe(
      (emoji) => {
        if (emoji) {
          const existingEmojiIndex = this.getExistingEmojiIndex(emoji);
          if (this.emojiAlreadyExists(existingEmojiIndex)) {
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

  emojiAlreadyExists(existingEmojiIndex: number) {
    return existingEmojiIndex !== -1;
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
