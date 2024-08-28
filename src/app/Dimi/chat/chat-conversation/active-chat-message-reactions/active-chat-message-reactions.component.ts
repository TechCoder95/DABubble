import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Emoji } from '../../../../shared/interfaces/emoji';
import { DatabaseService } from '../../../../shared/services/database.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { ChatService } from '../../../../shared/services/chat.service';
import { Subscription } from 'rxjs';
import { ReactionComponent } from './reaction/reaction.component';
import { GlobalsubService } from '../../../../shared/services/globalsub.service';

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
  @Input() messageType!:string;
  activeUser!: DABubbleUser;
  private databaseSubscription!: Subscription;
  currentEmoji!: Emoji;

  constructor(
    private databaseService: DatabaseService,
    public chatService: ChatService,
    private subService: GlobalsubService
  ) {
    this.activeUser = this.user;
  }

  ngOnInit(): void {
    this.loadEmojis();
  }

  ngOnDestroy(): void {
    if (this.databaseSubscription) 
      this.databaseSubscription.unsubscribe(); 
  }

  isReactionForCurrentMessage(emoji: Emoji) {
    return emoji.messageId === this.message.id;
  }

  loadEmojis() {

    this.databaseService.subscribeToEmojisofMessage(this.message.id);

    if (!this.databaseSubscription)
    this.databaseSubscription = this.subService.getEmojiObservable().subscribe((emoji: Emoji) => {
      if (emoji) {
        const existingEmojiIndex = this.getExistingEmojiIndex(emoji);
        if (this.emojiAlreadyExists(existingEmojiIndex)) {
          this.handleExistingEmoji(emoji, existingEmojiIndex);
        }
        else {
          if (emoji.id && !emoji.deleted)
          this.chatService.allEmojis.push(emoji);
        }
        this.currentEmoji = emoji;
      }
    });
  }

  emojiAlreadyExists(existingEmojiIndex: number) {
    return existingEmojiIndex !== -1;
  }

  getExistingEmojiIndex(emoji: Emoji) {
    return this.chatService.allEmojis.findIndex((e) => e.type === emoji.type && e.messageId === emoji.messageId);
  }

  handleExistingEmoji(newEmoji: Emoji, existingEmojiIndex: number) {
    const existingEmoji = this.chatService.allEmojis[existingEmojiIndex];
    if (newEmoji.usersIds.length === 0) {
      // Entferne den Emoji, wenn die neue Emoji-Liste leer ist
      this.chatService.allEmojis.splice(existingEmojiIndex, 1);
    } else if (!this.areUserIdsEqual(existingEmoji.usersIds, newEmoji.usersIds)) {
      // Aktualisiere den Emoji, wenn die Benutzer-IDs unterschiedlich sind
      this.chatService.allEmojis[existingEmojiIndex] = newEmoji;
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
    return this.chatService.allEmojis.some((e) => e.type === emoji.type && e.messageId === emoji.messageId);
  }
}
