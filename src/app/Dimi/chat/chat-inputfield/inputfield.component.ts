import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChannelService } from '../../../shared/services/channel.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { DatabaseService } from '../../../shared/services/database.service';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { MessageType } from '../../../shared/enums/messagetype';
import { ThreadMessage } from '../../../shared/interfaces/threadmessage';
import { TicketService } from '../../../shared/services/ticket.service';
import { Router, RouterModule } from '@angular/router';
import { EmojisPipe } from '../../../shared/pipes/emojis.pipe';
import { DAStorageService } from '../../../shared/services/dastorage.service';
import { AddFilesComponent } from './add-files/add-files.component';
import { EmojiesComponent } from './emojies/emojies.component';
import { LinkChannelMemberComponent } from './link-channel-member/link-channel-member.component';
import { SafeHtml } from '@angular/platform-browser';
import { HtmlConverterPipe } from "../../../shared/pipes/html-converter.pipe";

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
    HtmlConverterPipe
],
  providers: [EmojisPipe],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
})
export class InputfieldComponent implements OnInit {
  addFilesImg = './img/add-files-default.svg';
  addEmojiImg = './img/add-emoji-default.svg';
  addLinkImg = './img/add-link-default.svg';

  selectedThread: boolean = false;
  ticket: any;
  selectedChannel: TextChannel | null = null;
  activeUser!: DABubbleUser;
  usersInChannel: DABubbleUser[] = [];
  linkedUsers: DABubbleUser[] = [];

  textareaValue: SafeHtml = '';

  @Input() messageType: MessageType = MessageType.Directs;
  @Input() selectedChannelFromChat: any;
  @Input() activeUserFromChat: any;
  @Input() isSelectingUser: boolean | undefined;
  @Input() isSelectingChannel: boolean | undefined;
  fileInput: any;
  storage: any;

  constructor(
    public channelService: ChannelService,
    private userService: UserService,
    private databaseService: DatabaseService,
    private ticketService: TicketService,
    private router: Router,
    private storageService: DAStorageService,
    private emojiPipe: EmojisPipe,
    private cdr: ChangeDetectorRef,

  ) {
    this.activeUser = this.userService.activeUser;
    this.selectedChannel = JSON.parse(sessionStorage.getItem('selectedChannel')!);
  }


  ngOnInit(): void {
    this.getPlaceholderText();
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
        await this.send();
        break;
      case MessageType.Threads:
        await this.sendFromThread();
        break;
      case MessageType.NewDirect:
        if (this.isSelectingChannel)
          await this.sendMessageToChannel()
        else if (this.isSelectingUser)
          await this.sendMessageToUser();
        break;
      default:
        break;
    }
  }


  async sendMessageToChannel() {
    const selectedChannel = this.channelService.getSelectedChannel();
    if (selectedChannel) {
      this.selectedChannel = selectedChannel;
      await this.router.navigate(['/home/channel/' + selectedChannel.id]);
      await this.send();
    }
  }


  async sendMessageToUser() {
    const channel = await this.channelService.findOrCreateChannelByUserID();
    if (channel) {
      this.selectedChannel = channel;
      this.channelService.selectChannel(channel);
      await this.router.navigate(['/home/channel/' + channel.id]);
      await this.send();
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


  image!: string | ArrayBuffer;
  async send() {

    this.textareaValue = document.getElementById('textarea')!.innerHTML;
    let message: ChatMessage = this.returnCurrentMessage();

    if (message.message !== '' || this.image) {
      try {
        if (this.image) {
          message.imageUrl = await this.saveImageInStorage(message);
        }
        this.databaseService.addChannelDataToDB('messages', message);
        this.textareaValue = '';
        this.selectedFile = '';
        this.getPlaceholderText();
        this.linkedUsers = [];
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
      channelName: this.selectedChannel!.name,
      message: this.textareaValue.toString(),
      timestamp: new Date().getTime(),
      senderName: this.activeUser.username || 'guest',
      senderId: this.activeUser.id || 'senderIdDefault',
      edited: false,
      deleted: false,
      imageUrl: '',
      linkedUsers: this.linkedUsers.map((user) => `@${user.username}`),
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


  handleFocus() {
    const setRef = document.getElementById('textarea');
    if (setRef) {
      setRef.innerHTML = '';
    }
  }


  handleBlur() {
    this.getPlaceholderText();
  }

  handleEmoji(event: any) {
    document.getElementById('textarea')!.innerHTML += event.data;

  }


  getPlaceholderText(): void {
    const setRef = document.getElementById('textarea');

    if (setRef) {
      if (this.selectedFile) {
        setRef.innerHTML = '<div>Bildunterschrift hinzufügen</div>';
      }

      if (this.messageType === MessageType.NewDirect) {
        const selectedUser = this.userService.getSelectedUser();
        setRef.innerHTML = selectedUser
          ? `<textarea> style="color:gray">Nachricht an @${selectedUser.username}</textarea>`
          : '<div style="color:gray">Starte eine neue Nachricht</div>';
      }
      if (this.selectedChannel) {
        setRef.innerHTML = `<div style="color:gray">Nachricht an #${this.selectedChannel?.name}</div>`;
      }
    }
  }

  // handleSelectedEmoji(event: string) {
  //   let transformedEmoji = this.emojiPipe.transform(event);
  //   this.textareaValue += transformedEmoji;
  // }

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

  hasLinkedUsers(): boolean {
    return this.linkedUsers.length > 0;
  }

  handleLinkedUsernames(users: DABubbleUser[]) {
    this.linkedUsers = users;
  }
}
