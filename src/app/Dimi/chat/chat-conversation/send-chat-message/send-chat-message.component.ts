import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../../../../shared/services/chat.service';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../../shared/interfaces/chatmessage';
import { UserService } from '../../../../shared/services/user.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { SendChatMessageReactionComponent } from './send-chat-message-reaction/send-chat-message-reaction.component';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../../../shared/services/database.service';

@Component({
  selector: 'app-send-chat-message',
  standalone: true,
  imports: [CommonModule, SendChatMessageReactionComponent, FormsModule],
  templateUrl: './send-chat-message.component.html',
  styleUrl: './send-chat-message.component.scss',
})
export class SendChatMessageComponent implements OnInit {
  @Input() user!: DABubbleUser;
  @Input() sendMessage!: ChatMessage;
  inEditMessageMode: boolean = false;
  messageDeleted: boolean = false;
  @ViewChild('mainContainer') mainContainer!: ElementRef;
  originalMessage!: string;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.originalMessage = this.sendMessage.message;
  }

  getUserName() {
    let user = this.userService.getOneUserbyId(this.user.id!);
    return user?.username;
  }

  checkDate(date: number): string {
    const today = new Date();
    const givenDate = new Date(date);

    if (givenDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
      return 'Heute';
    } else {
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(givenDate);
    }
  }

  getUserAvatar(): string | undefined {
    let user = this.userService.getOneUserbyId(this.user.id!);
    return user?.avatar;
  }

  onEditModeChange(event: boolean) {
    this.inEditMessageMode = event;
    this.mainContainer.nativeElement.style.background = 'Antiquewhite';
    console.log(this.inEditMessageMode);
  }

  cancel() {
    this.sendMessage.message = this.originalMessage;
    this.mainContainer.nativeElement.style.background = 'unset';
    this.inEditMessageMode = false;
  }

  async save() {
    debugger;
    console.log(this.sendMessage.id);
    this.mainContainer.nativeElement.style.background = 'unset';
    this.sendMessage.edited = true;
    await this.databaseService.updateDataInDB(
      'messages',
      this.sendMessage.id!,
      this.sendMessage
    );
    this.inEditMessageMode = false;
  }

  async onDelete(event: boolean) {
    this.messageDeleted = event;
    this.sendMessage.message = '';
    this.sendMessage.deleted = true;
    await this.databaseService.updateDataInDB(
      'messages',
      this.sendMessage.id!,
      this.sendMessage
    );
  }
}
