import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
import { GlobalsubService } from '../../../shared/services/globalsub.service';

@Component({
  selector: 'app-chat-inputfield',
  standalone: true,
  imports: [CommonModule, CommonModule, FormsModule],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
})
export class InputfieldComponent implements OnInit {
  addFilesImg = './img/add-files-default.svg';
  addEmojiImg = './img/add-emoji-default.svg';
  addLinkImg = './img/add-link-default.svg';
  textareaValue: string = '';
  selectedThread: boolean = false;
  ticket: any;
  selectedChannel: TextChannel | null = null;
  activeUser!: DABubbleUser;

  @Input() messageType: MessageType = MessageType.Directs;
  @Input() selectedChannelFromChat: any;
  @Input() activeUserFromChat: any;
  fileInput: any;


  constructor(
    public channelService: ChannelService,
    private userService: UserService,
    private databaseService: DatabaseService,
    private ticketService: TicketService,
  ) {
    this.activeUser = this.userService.activeUser;
    this.selectedChannel = JSON.parse(sessionStorage.getItem('selectedChannel')!);
  }

  ngOnInit(): void {
    if (this.activeUserFromChat) {
      this.activeUserFromChat.subscribe((user: DABubbleUser) => {
        this.activeUser = user;
      });
    }

    if (this.selectedChannelFromChat) {
      this.selectedChannelFromChat.subscribe((channel: TextChannel) => {
        this.selectedChannel = channel;
      });
    }

    this.ticket = this.ticketService.getTicket();
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


  async sendMessage(type: MessageType) {
    switch (type) {
      case MessageType.Groups:
        await this.send();
        break;
      case MessageType.Directs:
        await this.send();
        break;
      case MessageType.Threads:
        await this.sendFromThread();
        break;
      case MessageType.NewDirect:
        await this.setSelectedChannel();
        await this.send();
        break;
      default:
        break;
    }
  }

  async sendFromThread() {
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
        await this.ticketService.sendThreads(threadMessage);
        console.log('mal sehen ob das klappt mit dem Thread', threadMessage);
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
      }
    }
  }

  async send() {
    let message: ChatMessage = {
      channelId: this.selectedChannel!.id,
      channelName: this.selectedChannel!.name,
      message: this.textareaValue,
      timestamp: new Date().getTime(),
      senderName: this.activeUser.username || 'guest',
      senderId: this.activeUser.id || 'senderIdDefault',
      edited: false,
      deleted: false,
    };

    if (message.message !== '') {
      try {
        this.databaseService.addChannelDataToDB('messages', message);
        this.textareaValue = '';
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
      }
    } else {
      alert('Du musst eine Nachricht eingeben');
    }
  }

  async setSelectedChannel() {
    try {
      let selectedUser = this.userService.getSelectedUser();
      if (selectedUser) {
        const channel = await this.channelService.createDirectChannel(
          selectedUser
        );
        this.selectedChannel = channel;
        // todo navigiere zu dem channel
        //    this.channelService.selectChannel(channel);
      }
    } catch (error) {
      console.log('Fehler beim Senden: ', error);
    }
  }

  handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage(this.messageType);
    }
  }

  filePreview: string | ArrayBuffer | null = null;
  /* fileName: string = ''; */

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      /* this.fileName = file.name; */
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.filePreview = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  sendFile(): void {
    // Implementieren Sie die Logik zum Senden der Datei
    console.log('Datei gesendet:');
  }

  getPlaceholderText(): string {
    if (this.messageType === MessageType.NewDirect) {
      const selectedUser = this.userService.getSelectedUser();
      return selectedUser ? `Nachricht an @${selectedUser.username}` : 'Starte eine neue Nachricht';
    }
    return `Nachricht an #${this.selectedChannel?.name}`;
  }


}
