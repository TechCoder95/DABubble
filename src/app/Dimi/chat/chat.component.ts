import { Component, EventEmitter, Input, input, OnInit, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatInformationComponent } from './chat-information/chat-information.component';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { InputfieldComponent } from './chat-inputfield/inputfield.component';
import { MessageType } from '../../shared/components/enums/messagetype';
import { GlobalsubService } from '../../shared/services/globalsub.service';

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
export class ChatComponent implements OnInit {

  @Input({required: true}) selectedChannelFromSidenav: any;
  @Input() allMessagesfromSideNav: any;
  @Input({required: true}) activeUserFromSidenav: any;

  messageType: MessageType = MessageType.Groups; // eventuell todo: kein Unterschied zwischen Direct und Group Messages
  // dimi fragen
  constructor() {
    
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    console.log('ChatComponent destroyed');
    
  }

}
