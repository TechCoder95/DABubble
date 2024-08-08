import { Component, EventEmitter, Input, Output, Pipe } from '@angular/core';
import { ChannelService } from '../../../shared/services/channel.service';
import { map, Observable, pipe, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../shared/services/chat.service';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { DatabaseService } from '../../../shared/services/database.service';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { MessageType } from '../../../shared/components/enums/messagetype';
import { ThreadMessage } from '../../../shared/interfaces/threadmessage';
import { TicketService } from '../../../shared/services/ticket.service';

@Component({
  selector: 'app-chat-inputfield',
  standalone: true,
  imports: [CommonModule, CommonModule, FormsModule],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
})
export class InputfieldComponent {
  addFilesImg = './img/add-files-default.svg';
  addEmojiImg = './img/add-emoji-default.svg';
  addLinkImg = './img/add-link-default.svg';
  textareaValue: string = '';
  activeUser!: DABubbleUser;
  selectedChannel: TextChannel | null = null;
  selectedThread: boolean = false;
  ticket: any;

  @Input() messageType: MessageType = MessageType.Directs;

  @Output() selectedChannelChanged = new EventEmitter<TextChannel>();

  //hier swillich den aktiven Channel an das parent component weitergeben

  constructor(
    public channelService: ChannelService,
    private chatService: ChatService,
    private userService: UserService,
    private databaseService: DatabaseService,
    private ticketService: TicketService
  ) {
    this.activeUser = this.userService.activeUser;
    this.subscribeToDataChanges();
    this.ticket = this.ticketService.getTicket();
  }

  subscribeToDataChanges() {
    this.databaseService.onDataChange$.subscribe(async (channel) => {
      this.selectedChannel = channel;
      this.selectedChannelChanged.emit(channel);
    });
  }

  changeAddFilesImg(hover: boolean) {
    if (hover) {
      this.addFilesImg = './img/add-files-hover.svg';
      this.addEmojiImg = './img/add-emoji.svg';
      this.addLinkImg = './img/add-link.svg';
    } else {
      this.setDefaultImages();
    }
  }

  changeAddEmojiImg(hover: boolean) {
    if (hover) {
      this.addEmojiImg = './img/add-emoji-hover.svg';
      this.addFilesImg = './img/add-files.svg';
      this.addLinkImg = './img/add-link.svg';
    } else {
      this.setDefaultImages();
    }
  }

  changeAddLinkImg(hover: boolean) {
    if (hover) {
      this.addLinkImg = './img/add-link-hover.svg';
      this.addEmojiImg = './img/add-emoji.svg';
      this.addFilesImg = './img/add-files.svg';
    } else {
      this.setDefaultImages();
    }
  }

  setDefaultImages() {
    this.addFilesImg = './img/add-files-default.svg';
    this.addEmojiImg = './img/add-emoji-default.svg';
    this.addLinkImg = './img/add-link-default.svg';
  }

  get placeholderText(): Observable<string> {
    return this.channelService.selectedChannel$.pipe(
      map((channel: any) => `Nachricht an #${channel?.name || 'Channel'}`)
    );
  }
  inThreads: boolean = false;
  async sendMessage(type: MessageType) {
    switch (type) {
      case MessageType.Groups:
        await this.send();
        break;
      case MessageType.Directs:
        await this.send();
        break;
      case MessageType.Threads:
        this.inThreads = true;
        await this.send(); // todo für Rabia. Eventuell brauchst du auch die die send() methode oder eine modifizierte Version davon ;)
        break;
      case MessageType.NewDirect:
        await this.setSelectedChannel();
        await this.send();
        break;
      default:
        break;
    }
  }
  /* 
  sendThread(){
    let thread:ThreadMessage={
      ticketId: string;
      message: string;
      timestamp: number;
      senderName: string;
      senderId: string;
      threadConversationId?: string[];
      emoticons?: string[];
      id?: string;
      edited?: boolean;
      deleted?: boolean;
    }
  } */

  async send() {
    if (!this.inThreads) {
      let message: ChatMessage = {
        channelId: this.selectedChannel!.id,
        channelName: this.selectedChannel!.name,
        message: this.textareaValue,
        timestamp: new Date().getTime(),
        senderName: this.activeUser.username || 'guest',
        senderId: this.activeUser.id || 'senderIdDefault',
        emoticons: [],
        edited: false,
        deleted: false,
      };

      if (message.message !== '') {
        try {
          const newMessageId = await this.databaseService.addChannelDataToDB(
            'messages',
            message
          );
          message.id = newMessageId;
          this.chatService.sendMessage(message);
          this.textareaValue = '';
        } catch (error) {
          console.error('Fehler beim Senden der Nachricht:', error);
        }
      } else {
        alert('Du musst eine Nachricht eingeben');
      }
    } else if (this.inThreads) {
      let threadMessage: ThreadMessage = {
        ticketId: this.ticket.id,
        message: this.textareaValue,
        timestamp: new Date().getTime(),
        senderName: this.activeUser.username || 'guest',
        senderId: this.activeUser.id || 'senderIdDefault',
        emoticons: [],
        edited: false,
        deleted: false,
      };
      if (threadMessage.message !== '') {
        try {
          const newMessageId = await this.databaseService.addChannelDataToDB('threads', threadMessage);
          threadMessage.id = newMessageId;
          this.ticketService.sendThreads(threadMessage);
          this.textareaValue = '';
        } catch (error) {
          console.error('Fehler beim Senden der Nachricht:', error);
        }
      } else {
        alert('Du musst eine Nachricht eingeben');
      }

      await this.ticketService.sendThreads(threadMessage);
      console.log('mal sehen ob das klappt mit dem Thread', threadMessage);
    } else {
      console.error('Kein Channel ausgewählt');
    }
  }

  async setSelectedChannel() {
    let selectedUser = this.userService.getSelectedUser();
    if (selectedUser) {
      const channel = await this.channelService.createDirectChannelIfNotExists(
        selectedUser
      );
      this.channelService.selectChannel(channel);
      this.selectedChannel = channel;
    }
  }

  handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage(this.messageType);
    }
  }
}
