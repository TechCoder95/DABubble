import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatInformationComponent } from './chat-information/chat-information.component';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { ChatMessage } from '../../shared/interfaces/chatmessage';
import { DABubbleUser } from '../../shared/interfaces/user';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../../shared/services/database.service';
import { ChannelService } from '../../shared/services/channel.service';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatCardModule, ChatConversationComponent, ChatInformationComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  selectedChannel: TextChannel | null = null;
  messages: ChatMessage[] = [];
  users: DABubbleUser[] = [];
  private channelSubscription!: Subscription;

  constructor(
    private dbService: DatabaseService,
    private channelService: ChannelService
  ) {}

  ngOnInit(): void {
    this.channelSubscription = this.channelService.selectedChannel$.subscribe(
      async (channel) => {
        if (channel) {
          this.selectedChannel = channel;
          this.messages = await this.dbService.getMessagesByChannel(
            channel.name
          );
          /*  this.users = await this.dbService.getUsersByChannel(channel.id); */
        } else {
          this.messages = [];
          this.users = [];
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  }
}
