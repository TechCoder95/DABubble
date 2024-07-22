import { Component, Input } from '@angular/core';
import { ChatService } from '../../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../../shared/interfaces/chatmessage';

@Component({
  selector: 'app-send-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './send-chat-message.component.html',
  styleUrl: './send-chat-message.component.scss',
})
export class SendChatMessageComponent {
  constructor(private chatService: ChatService) {}

  @Input() sendMessage!: ChatMessage;
}
