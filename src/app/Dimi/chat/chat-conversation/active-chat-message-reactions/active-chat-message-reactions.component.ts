import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Emoji } from '../../../../shared/interfaces/emoji';
import { UserService } from '../../../../shared/services/user.service';
import { DatabaseService } from '../../../../shared/services/database.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { ChatService } from '../../../../shared/services/chat.service';
import { Subscription } from 'rxjs';
import { ReactionComponent } from './reaction/reaction.component';
import { ChatMessage } from '../../../../shared/interfaces/chatmessage';
import { tick } from '@angular/core/testing';

@Component({
  selector: 'app-active-chat-message-reactions',
  standalone: true,
  imports: [CommonModule, ReactionComponent],
  templateUrl: './active-chat-message-reactions.component.html',
  styleUrl: './active-chat-message-reactions.component.scss',
})
export class ActiveChatMessageReactionsComponent implements OnInit, OnDestroy {
  @Input() message!: any;
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

  isReactionForCurrentMessage(emoji: Emoji) {
    return emoji.messageId === this.message.id;
  }

  loadEmojis() {
    let emojisOnMessage = this.message.emoticons;

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
        }
      }
    );
  }
  
  emojiAlreadyExists(existingEmojiIndex: number) {
    return existingEmojiIndex !== -1;
  }
  
  getExistingEmojiIndex(emoji: Emoji) {
    return this.allEmojis.findIndex((e) => e.type === emoji.type && e.messageId === emoji.messageId);
  }
  
  handleExistingEmoji(newEmoji: Emoji, existingEmojiIndex: number) {
    const existingEmoji = this.allEmojis[existingEmojiIndex];
    if (newEmoji.usersIds.length === 0) {
      // Entferne den Emoji, wenn die neue Emoji-Liste leer ist
      this.allEmojis.splice(existingEmojiIndex, 1);
    } else if (!this.areUserIdsEqual(existingEmoji.usersIds, newEmoji.usersIds)) {
      // Aktualisiere den Emoji, wenn die Benutzer-IDs unterschiedlich sind
      this.allEmojis[existingEmojiIndex] = newEmoji;
    }
  }
  
  areUserIdsEqual(usersIds1: string[], usersIds2: string[]) {
    if (usersIds1.length !== usersIds2.length) {
      return false;
    }
    const sortedIds1 = [...usersIds1].sort();
    const sortedIds2 = [...usersIds2].sort();
    return sortedIds1.every((id, index) => id === sortedIds2[index]);
  }
  
  emojiExists(emoji: Emoji) {
    return this.allEmojis.some((e) => e.type === emoji.type && e.messageId === emoji.messageId);
  }
}
