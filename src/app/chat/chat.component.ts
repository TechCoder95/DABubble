import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatInformationComponent } from './chat-information/chat-information.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatCardModule, ChatConversationComponent, ChatInformationComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {}
