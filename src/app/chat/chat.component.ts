import { Component } from '@angular/core';
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ChatHeaderComponent, MatCardModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {

}
