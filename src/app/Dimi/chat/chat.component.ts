import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatInformationComponent } from './chat-information/chat-information.component';
import { TextChannel } from '../../shared/interfaces/textchannel';
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

  @Input() selectedChannelFromInput: TextChannel | null = null;

  @Output() selectedChannelChanged = new EventEmitter<TextChannel>();

  messageType: MessageType = MessageType.Groups; // eventuell todo: kein Unterschied zwischen Direct und Group Messages
  // dimi fragen
  constructor() { }

  selectedChannel(channel : TextChannel) {
    this.selectedChannelChanged.emit(channel);
  }

  ngOnDestroy() {
    console.log('ChatComponent destroyed');
    
  }

}
