import { Component } from '@angular/core';
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
import { InputfieldComponent } from './chat-inputfield/inputfield.component';
import { MessageType } from '../../shared/components/enums/messagetype';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MatCardModule,
    ChatConversationComponent,
    ChatInformationComponent,
    InputfieldComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {

  messageType: MessageType = MessageType.Groups; // eventuell todo: kein Unterschied zwischen Direct und Group Messages
  // dimi fragen
  constructor() { }
}
