import { Component } from '@angular/core';
import { InputfieldComponent } from '../../Dimi/chat/chat-inputfield/inputfield.component';
import { MatCardModule, MatCardTitle } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [InputfieldComponent, MatCardModule, MatCardTitle, MatInputModule],
  templateUrl: './new-chat.component.html',
  styleUrl: './new-chat.component.scss'
})
export class NewChatComponent {

}
