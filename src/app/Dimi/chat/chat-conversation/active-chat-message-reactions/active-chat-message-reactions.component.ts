import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Emoji } from '../../../../shared/interfaces/emoji';
import { DatabaseService } from '../../../../shared/services/database.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { ReactionComponent } from './reaction/reaction.component';
import { EmojiService } from '../../../../shared/services/emoji.service';

@Component({
  selector: 'app-active-chat-message-reactions',
  standalone: true,
  imports: [CommonModule, ReactionComponent],
  templateUrl: './active-chat-message-reactions.component.html',
  styleUrl: './active-chat-message-reactions.component.scss',
})
export class ActiveChatMessageReactionsComponent {
  @Input() message!: any;
  @Input() user!: DABubbleUser;
  activeUser!: DABubbleUser;

  constructor(
    private databaseService: DatabaseService,
    public emojiService: EmojiService,
  ) {
  }
  ngOnInit(): void {
    this.databaseService.subscribeToEmojisofMessage(this.message.id);
  }


  isReactionForCurrentMessage(emoji: Emoji) {
    return emoji.messageId === this.message.id;
  }

  
}
