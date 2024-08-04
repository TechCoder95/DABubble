import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ThreadChatComponent } from "./thread-chat/thread-chat.component";
import { InputfieldComponent } from "../../Dimi/chat/chat-inputfield/inputfield.component";
import { SidenavComponent } from '../../tristan/sidenav/sidenav.component';
import { ChannelService } from '../../shared/services/channel.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MatCardModule, ThreadChatComponent, InputfieldComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
  showSingleThread!: boolean;
 

  constructor(private channelService: ChannelService) { }


  close() {
    this.channelService.showSingleThread = false;
  }
  
}
