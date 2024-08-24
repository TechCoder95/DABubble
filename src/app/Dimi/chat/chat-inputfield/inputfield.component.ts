import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { ChannelService } from '../../../shared/services/channel.service';
import { async, map, Observable, pipe, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../shared/services/chat.service';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { DatabaseService } from '../../../shared/services/database.service';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { MessageType } from '../../../shared/enums/messagetype';
import { ThreadMessage } from '../../../shared/interfaces/threadmessage';
import { TicketService } from '../../../shared/services/ticket.service';
import { GlobalsubService } from '../../../shared/services/globalsub.service';
import { Router, RouterModule } from '@angular/router';
import { EmojisPipe } from '../../../shared/pipes/emojis.pipe';
import { DAStorageService } from '../../../shared/services/dastorage.service';
import { AddFilesComponent } from './add-files/add-files.component';
import { EmojiesComponent } from './emojies/emojies.component';
import { LinkChannelMemberComponent } from './link-channel-member/link-channel-member.component';
import { user } from '@angular/fire/auth';
import { ThreadService } from '../../../shared/services/thread.service';

@Component({
  selector: 'app-chat-inputfield',
  standalone: true,
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    RouterModule,
    EmojisPipe,
    EmojiesComponent,
    AddFilesComponent,
    LinkChannelMemberComponent,
  ],
  providers: [EmojisPipe],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
})
export class InputfieldComponent implements OnInit {
  addFilesImg = './img/add-files-default.svg';
  addEmojiImg = './img/add-emoji-default.svg';
  addLinkImg = './img/add-link-default.svg';
  textareaValue: string = '';
  ticket: any;
  selectedChannel: TextChannel | null = null;

  selectedThread: TextChannel | null = null;

  activeUser!: DABubbleUser;
  usersInChannel: DABubbleUser[] = [];
  threadOwner!: DABubbleUser;
  selectedMessage!: ChatMessage;

  @Input() messageType: MessageType = MessageType.Directs;
  @Input() selectedChannelFromChat: any;
  @Input() activeUserFromChat: any;
  fileInput: any;

  @Input() selectedThreadOwner: any;

  storage: any;

  constructor(
    public channelService: ChannelService,
    private userService: UserService,
    private databaseService: DatabaseService,
    private ticketService: TicketService,
    private router: Router,
    private storageService: DAStorageService,
    private emojiPipe: EmojisPipe,
    private threadService: ThreadService,
  ) {
    this.activeUser = this.userService.activeUser;
    this.selectedChannel = JSON.parse(
      sessionStorage.getItem('selectedChannel')!,
    );
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

    if (this.selectedThreadOwner) {
      this.selectedThreadOwner.subscribe((threadOwner: any) => {
        this.threadOwner = threadOwner;
      });
    }

    if (this.threadService.selectedMessage) {
      this.threadService.selectedMessage.subscribe((selectedMessage: any) => {
        this.selectedMessage = selectedMessage[0];
      });
    }
    this.ticket = this.ticketService.getTicket();

    this.getUsersInChannel();
  }

   async getUsersInChannel() {
    this.selectedChannel?.assignedUser.forEach((id) => {
      this.userService.getOneUserbyId(id).then((user: DABubbleUser) => {
        if (user !== null && user !== undefined) {
          this.usersInChannel.push(user);
        }
      });
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

  async sendMessage(type: MessageType) {
    switch (type) {
      case MessageType.Groups:
      case MessageType.Directs:
        this.selectedChannel = JSON.parse(sessionStorage.getItem('selectedChannel')!);
        await this.send();
        break;
      case MessageType.Threads:
        this.selectedChannel = JSON.parse(sessionStorage.getItem('selectedThread')!);
        await this.send();
        break;
      case MessageType.NewDirect:
        const channel = await this.channelService.findOrCreateChannelByUserID();
        if (channel) {
          this.selectedChannel = channel;
          this.channelService.selectChannel(channel);
          await this.router.navigate(['/home/channel/' + channel.id]);
          await this.send();
        }
        break;
      default:
        break;
    }
  }



  image!: string | ArrayBuffer;
  async send() {
    let message: ChatMessage = this.returnCurrentMessage();

    if (message.message !== '' || this.image) {
      try {
        if (this.image) {
          message.imageUrl = await this.saveImageInStorage(message);
        }
        this.databaseService.addChannelDataToDB('messages', message);
        this.textareaValue = '';
        this.selectedFile = '';
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
      }
    } else {
      alert('Du musst eine Nachricht eingeben');
    }
  }

  returnCurrentMessage() {
    return {
      channelId: this.selectedChannel!.id,
      channelName: this.selectedChannel!.name || this.activeUser.username,
      message: this.textareaValue,
      timestamp: new Date().getTime(),
      senderName: this.activeUser.username || 'guest',
      senderId: this.activeUser.id || 'senderIdDefault',
      edited: false,
      deleted: false,
      imageUrl: '',
      isThreadMsg: this.messageType === MessageType.Threads,
    };
  }

  async saveImageInStorage(message: ChatMessage): Promise<string> {
    // Bild in Firestore Storage hochladen
    let imageBlob: Blob;
    if (typeof this.image === 'string') {
      const byteString = atob(this.image.split(',')[1]);
      const mimeString = this.image.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      imageBlob = new Blob([ab], { type: mimeString });
    } else {
      imageBlob = new Blob([this.image]);
    }
    let imageUrl: any = await this.storageService.uploadMessageImage(
      message.channelId,
      imageBlob,
      this.fileName,
    );
    return imageUrl;
  }

  handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage(this.messageType);
    }
  }

  getPlaceholderText(): string {
    if (this.selectedFile) {
      return 'Bildunterschrift hinzufügen';
    }
    if (this.messageType === MessageType.NewDirect) {
      const selectedUser = this.userService.getSelectedUser();
      return selectedUser ? `Nachricht an @${selectedUser.username}` : 'Starte eine neue Nachricht';
    } else if (this.messageType === MessageType.Threads) {
      return `Habe es auskommentiert`;
      // Habe es auskommentiert, konnt den Konsolenfehler nicht beheben
      // return `Nachricht an ${this.selectedMessage.senderName}`;
    }
    return `Nachricht an #${this.selectedChannel?.name}`;
  }

  handleSelectedEmoji(event: string) {
    let transformedEmoji = this.emojiPipe.transform(event);
    this.textareaValue += transformedEmoji;
  }

  selectedFile: string | ArrayBuffer | null = null;
  fileName: string = '';

  handleSelectedFile(event: string | ArrayBuffer) {
    this.selectedFile = event;
    this.image = event;
    this.getPlaceholderText();
  }

  handleFileName(event: string) {
    this.fileName = event;
  }

  handleLinkedUsernames(users: DABubbleUser[]) {
    if (this.usersInChannel.length === users.length) {
      let linkedUserString = '@Alle';
      this.textareaValue += linkedUserString;
      this.changeAddLinkImg(false);
    } else {
      let usernamesString = users
        .map((user) => `@${user.username} `)
        .join(', ');
      this.textareaValue += usernamesString;
    }
  }
}
