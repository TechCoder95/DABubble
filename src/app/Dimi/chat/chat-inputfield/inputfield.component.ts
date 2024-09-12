import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ChannelService } from '../../../shared/services/channel.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { ChatMessage } from '../../../shared/interfaces/chatmessage';
import { DatabaseService } from '../../../shared/services/database.service';
import { TextChannel } from '../../../shared/interfaces/textchannel';
import { MessageType } from '../../../shared/enums/messagetype';
import { Router, RouterModule } from '@angular/router';
import { EmojisPipe } from '../../../shared/pipes/emojis.pipe';
import { DAStorageService } from '../../../shared/services/dastorage.service';
import { AddFilesComponent } from './add-files/add-files.component';
import { EmojiesComponent } from './emojies/emojies.component';
import { LinkChannelMemberComponent } from './link-channel-member/link-channel-member.component';
import { HtmlConverterPipe } from '../../../shared/pipes/html-converter.pipe';
import { SafeResourceUrl } from '@angular/platform-browser';
import { VerlinkungPipe } from '../../../shared/pipes/verlinkung.pipe';
import { EmojiInputPipe } from '../../../shared/pipes/emoji-input.pipe';
import { LinkChannelComponent } from './link-channel/link-channel.component';
import { filter } from 'rxjs';

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
    HtmlConverterPipe,
    VerlinkungPipe,
    EmojiInputPipe,
    LinkChannelComponent
  ],
  providers: [EmojisPipe],
  templateUrl: './inputfield.component.html',
  styleUrl: './inputfield.component.scss',
})
export class InputfieldComponent implements OnInit, AfterViewInit {
  addFilesImg = './img/add-files-default.svg';
  addEmojiImg = './img/add-emoji-default.svg';
  addLinkImg = './img/add-link-default.svg';

  selectedThread: boolean = false;
  selectedChannel: TextChannel | null = null;

  activeUser!: DABubbleUser;
  usersInChannel: DABubbleUser[] = [];
  linkedUsers: DABubbleUser[] = [];
  threadOwner!: DABubbleUser;
  selectedMessage!: ChatMessage;

  textareaValue: string = '';

  @Input() messageType: MessageType = MessageType.Directs;
  @Input() selectedChannelFromChat: any;
  @Input() activeUserFromChat: any;
  @Input() isSelectingUser: boolean | undefined;
  @Input() isSelectingChannel: boolean | undefined;
  fileInput: any;

  @Input() selectedThreadOwner: any;

  @ViewChild('chatTextarea') chatTextarea!: ElementRef;

  storage: any;
  linkWindowOpen = false;
  linkChannelWindowOpen = false;
  linkedChannel: TextChannel[] = [];

  ChannelsFromUser!: TextChannel[];

  constructor(
    public channelService: ChannelService,
    private userService: UserService,
    private databaseService: DatabaseService,
    private router: Router,
    private storageService: DAStorageService,
  ) {
    this.activeUser = this.userService.activeUser;
    this.selectedChannel = JSON.parse(
      sessionStorage.getItem('selectedChannel')!,
    );
  }

  ngAfterViewInit(): void {
    this.chatTextarea.nativeElement.focus();
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
    this.getUsersInChannel();
    this.getChannelFromUser();
  }

  /**
   * Retrieves the users in the selected channel.
   *
   * @returns {Promise<void>} A promise that resolves when the users in the channel are retrieved.
   */
  async getUsersInChannel() {
    this.selectedChannel?.assignedUser.forEach((id) => {
      this.userService.getOneUserbyId(id).then((user: DABubbleUser) => {
        if (user !== null && user !== undefined) {
          this.usersInChannel.push(user);
        }
      });
    });
  }

  async getChannelFromUser() {
    this.databaseService.readDataByArray('channels', 'assignedUser', this.activeUser.id!).then((channels: TextChannel[]) => {
      channels = channels.filter((channel) => channel.isPrivate === false);
      this.ChannelsFromUser = channels;
      
    });
  }

  /**
   * Changes the images displayed when hovering over the input field.
   *
   * @param hover - A boolean indicating whether the input field is being hovered over.
   */
  changeAddFilesImg(hover: boolean) {
    if (hover) {
      this.addFilesImg = './img/add-files-hover.svg';
      this.addEmojiImg = './img/add-emoji.svg';
      this.addLinkImg = './img/add-link.svg';
    } else {
      this.setDefaultImages();
    }
  }

  /**
   * Changes the image paths for adding emojis based on the hover state.
   *
   * @param hover - A boolean indicating whether the hover state is active or not.
   */
  changeAddEmojiImg(hover: boolean) {
    if (hover) {
      this.addEmojiImg = './img/add-emoji-hover.svg';
      this.addFilesImg = './img/add-files.svg';
      this.addLinkImg = './img/add-link.svg';
    } else {
      this.setDefaultImages();
    }
  }

  /**
   * Changes the images for adding a link, emoji, and files based on the hover state.
   *
   * @param hover - A boolean indicating whether the hover state is active or not.
   */
  changeAddLinkImg(hover: boolean) {
    if (hover) {
      this.addLinkImg = './img/add-link-hover.svg';
      this.addEmojiImg = './img/add-emoji.svg';
      this.addFilesImg = './img/add-files.svg';
    } else {
      this.setDefaultImages();
    }
  }

  /**
   * Sets the default images for the chat input field.
   */
  setDefaultImages() {
    this.addFilesImg = './img/add-files-default.svg';
    this.addEmojiImg = './img/add-emoji-default.svg';
    this.addLinkImg = './img/add-link-default.svg';
  }

  /**
   * Sends a message based on the given MessageType.
   *
   * @param type - The type of message to send.
   * @returns A promise that resolves when the message is sent.
   */
  async sendMessage(type: MessageType) {
    switch (type) {
      case MessageType.Groups:
      case MessageType.Directs:
        this.selectedChannel = JSON.parse(
          sessionStorage.getItem('selectedChannel')!,
        );
        await this.send();
        break;
      case MessageType.Threads:
        this.selectedChannel = JSON.parse(
          sessionStorage.getItem('selectedThread')!,
        );
        await this.send();
        break;
      case MessageType.NewDirect:
        if (this.isSelectingChannel) {
          await this.sendMessageToGroupChannel();
        } else if (this.isSelectingUser) {
          await this.sendMessageToUser();
        }
        break;
      default:
        break;
    }
  }

  /**
   * Sends a message to the selected group channel.
   *
   * @returns {Promise<void>} A promise that resolves when the message is sent.
   */
  async sendMessageToGroupChannel() {
    const selectedChannel = this.channelService.getSelectedChannel();
    if (selectedChannel) {
      this.selectedChannel = selectedChannel;
      await this.router.navigate(['/home/channel/' + selectedChannel.id]);
      await this.send();
    }
  }

  /**
   * Sends a message to the user.
   *
   * @returns {Promise<void>} A promise that resolves when the message is sent.
   */
  async sendMessageToUser() {
    const channel = await this.channelService.findOrCreateChannelByUserID();
    if (channel) {
      this.selectedChannel = channel;
      this.channelService.selectChannel(channel);
      await this.router.navigate(['/home/channel/' + channel.id]);
      await this.send();
    }
  }

  image!: string | ArrayBuffer;
  pdf: SafeResourceUrl | null = null;

  /**
   * Sends a chat message.
   *
   * @returns {Promise<void>} A promise that resolves when the message is sent.
   * @throws {Error} If there is an error while sending the message.
   */
  async send() {
    let message: ChatMessage = this.returnCurrentMessage();

    if (message.message !== '' || this.image) {
      try {
        if (this.image || this.pdf) {
          message.fileUrl = await this.saveFileInStorage(message);
          message.fileName = this.fileName;
        }

        this.databaseService.addChannelDataToDB('messages', message);

        if (this.messageType === MessageType.Threads) {
          this.selectedMessage = JSON.parse(
            sessionStorage.getItem('threadMessage')!,
          );
          this.selectedMessage.replyNumber =
            this.selectedMessage.replyNumber + 1;
          this.selectedMessage.lastRepliedTime = message.timestamp;
          this.databaseService.updateDataInDB(
            'messages',
            this.selectedMessage.id!,
            this.selectedMessage,
          );
          sessionStorage.setItem(
            'threadMessage',
            JSON.stringify(this.selectedMessage),
          );
        }
        this.textareaValue = '';
        this.selectedFile = '';
        this.image = '';
        this.getPlaceholderText();
        this.linkedUsers = [];
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
      }
    }
  }

  /**
   * Returns the current message object.
   *
   * @returns {Object} The current message object with the following properties:
   *   - `channelId`: The ID of the selected channel.
   *   - `channelName`: The name of the selected channel or the username of the active user.
   *   - `message`: The value of the textarea.
   *   - `timestamp`: The current timestamp.
   *   - `senderName`: The username of the active user or 'guest' if not available.
   *   - `senderId`: The ID of the active user or 'senderIdDefault' if not available.
   *   - `edited`: A boolean indicating if the message has been edited.
   *   - `deleted`: A boolean indicating if the message has been deleted.
   *   - `imageUrl`: The URL of an image associated with the message.
   *   - `isThreadMsg`: A boolean indicating if the message is a thread message.
   *   - `fileUrl`: The URL of a file associated with the message.
   *   - `replyNumber`: The number of replies to the message.
   *   - `lastRepliedTime`: The timestamp of the last reply to the message.
   */
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
      fileUrl: '',
      replyNumber: 0,
      lastRepliedTime: new Date().getTime(),
    };
  }

  /**
   * Saves a file in the Firestore Storage.
   *
   * @param message - The ChatMessage object.
   * @returns A Promise that resolves to the URL of the uploaded file.
   */
  async saveFileInStorage(message: ChatMessage): Promise<string> {
    // Bild/PDF in Firestore Storage hochladen
    let fileBlob: Blob;
    if (typeof this.image === 'string') {
      const byteString = atob(this.image.split(',')[1]);
      const mimeString = this.image.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      fileBlob = new Blob([ab], { type: mimeString });
    } else {
      fileBlob = new Blob([this.image]);
    }
    let imageUrl: any = await this.storageService.uploadMessageImage(
      message.channelId,
      fileBlob,
      this.fileName,
    );
    return imageUrl;
  }

  /**
   * Handles the Enter key event.
   *
   * @param event - The keyboard event.
   */
  handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage(this.messageType);
    }
  }

  /**
   * Handles the focus event.
   */
  handleFocus() {
    const setRef = document.getElementById('textarea');
    if (setRef) setRef.innerHTML = '';
  }

  /**
   * Handles the blur event of the input field.
   */
  handleBlur() {
    this.getPlaceholderText();
  }

  /**
   * Handles the emoji event.
   *
   * @param event - The event object containing the emoji data.
   */
  handleEmoji(event: any) {
    document.getElementById('textarea')!.innerHTML += event.data;
  }

  /**
   * Returns the placeholder text based on the current state of the input field.
   *
   * @returns The placeholder text.
   */
  getPlaceholderText(): string {
    if (this.image) {
      return 'Bildunterschrift hinzufügen';
    }

    if (this.pdf) {
      return 'PDF kommentieren';
    }

    if (this.messageType === MessageType.NewDirect) {
      const selectedUser = this.userService.getSelectedUser();
      return selectedUser
        ? `Nachricht an @${selectedUser.username}`
        : 'Starte eine neue Nachricht';
    }

    if (this.messageType === MessageType.Groups) {
      if (this.selectedChannel) {
        return `Nachricht an #${this.selectedChannel?.name}`;
      }
      return 'Starte eine neue Nachricht';
    }

    if (this.messageType === MessageType.Threads) {
      const channelname = JSON.parse(
        sessionStorage.getItem('threadMessage')!,
      ).message;
      if (this.selectedChannel) {
        return `Antworten an Thread #${channelname}`;
      }
      return 'Starte eine neue Nachricht';
    }
    return '';
  }

  selectedFile: string | ArrayBuffer | null = null;
  fileName: string = '';

  /**
   * Handles the selected file event.
   *
   * @param event - The selected file event.
   */
  handleSelectedFile(event: string) {
    this.selectedFile = event;

    if (this.selectedFile.includes('image/')) {
      this.image = this.selectedFile;
    } else if (this.selectedFile.includes('application/pdf')) {
      this.pdf = this.selectedFile;
    } else {
      this.image = '';
      this.pdf = '';
    }

    this.getPlaceholderText();
  }

  /**
   * Sets the value of the fileName property.
   *
   * @param event - The event containing the new file name.
   */
  handleFileName(event: string) {
    this.fileName = event;
  }

  /**
   * Checks if there are any linked users.
   *
   * @returns {boolean} True if there are linked users, false otherwise.
   */
  hasLinkedUsers(): boolean {
    return this.linkedUsers.length > 0;
  }

  /**
   * Handles the linked usernames in the chat input field.
   *
   * @param users - An array of DABubbleUser objects representing the linked usernames.
   */
  handleLinkedUsernames(users: DABubbleUser[]) {
    users.forEach((user) => {
      if (!this.textareaValue.includes(`@${user.username}\u200B `)) {

        //ich will das letzte zeichen löschen und dann den user einfügen
        this.textareaValue = this.textareaValue.slice(0, -1);
        this.textareaValue += `@${user.username}\u200B `;
      }
    });
  }

    /**
   * Handles the linked usernames in the chat input field.
   *
   * @param users - An array of DABubbleUser objects representing the linked usernames.
   */
    handleLinkedChannels(channel: TextChannel[]) {
      channel.forEach((channel) => {
        if (!this.textareaValue.includes(`${channel.name}\u200B `)) {
          this.textareaValue += `${channel.name}\u200B `;
        }
      });
    }

  /**
   * Handles the selected emoji event.
   *
   * @param event - The selected emoji.
   */
  handleSelectedEmoji(event: string) {
    this.textareaValue += event + ' ';
  }

  handleTextareaInput(event: Event) {

    const iEvent = event as InputEvent;

    if (iEvent.inputType === 'insertText' && iEvent.data === '@') {
        this.linkWindowOpen = true;
    } else if (iEvent.inputType === 'insertText' && iEvent.data === '#') {
        this.linkChannelWindowOpen = true;
    } else {
        this.linkWindowOpen = false;
        this.linkChannelWindowOpen = false;
    }
}
}
