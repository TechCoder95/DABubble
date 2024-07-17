import { Component } from '@angular/core';
import { InputfieldComponent } from './chat-inputfield/inputfield.component';

@Component({
  selector: 'app-chat-conversation',
  standalone: true,
  imports: [InputfieldComponent],
  templateUrl: './chat-conversation.component.html',
  styleUrl: './chat-conversation.component.scss'
})
export class ChatConversationComponent {

}
