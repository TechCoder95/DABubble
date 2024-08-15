import { Component, Input } from '@angular/core';
import { ChatService } from '../../../../shared/services/chat.service';
import { UserService } from '../../../../shared/services/user.service';
import { ChannelService } from '../../../../shared/services/channel.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TextChannel } from '../../../../shared/interfaces/textchannel';

@Component({
  selector: 'app-pre-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pre-chat-message.component.html',
  styleUrl: './pre-chat-message.component.scss',
})
export class PreChatMessageComponent {
  activeUser: DABubbleUser = JSON.parse(sessionStorage.getItem('userLogin')!);
  isPrivateChat!: boolean;
  isChatWithMyself!: boolean;
  privateChatPartner!: DABubbleUser | undefined;
  channelName!: string | undefined;

  @Input({required:true}) activeChannelFromChatconv!: any

  selectedChannel: TextChannel = JSON.parse(sessionStorage.getItem('selectedChannel')!);

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService
  ) {
    this.getChannelName();
    this.getPrivateChatPartner();
  }


  ngOnInit(): void {
    this.activeChannelFromChatconv.subscribe(
      (channel : TextChannel) => {
        this.selectedChannel = channel;
        this.isPrivateChat = channel.isPrivate;
        this.getChannelName();
        this.getPrivateChatPartner();
      }
    );
    this.isPrivateChat = JSON.parse(sessionStorage.getItem('selectedChannel')!).isPrivate;
  }


  getChannelName() {
    if (!this.isPrivateChat) {
      this.channelName = this.channelService.channel.name;
    }
  }

  
  async getPrivateChatPartner() {
    if (this.isPrivateChat && !this.isChatWithMyself) {
      const privateChatPartnerID =
        this.channelService.channel.assignedUser.find(
          (userID) => userID !== this.userService.activeUser.id
        );

      if (privateChatPartnerID) {
        this.privateChatPartner = await this.userService.getOneUserbyId(
          privateChatPartnerID
        );
      }
    }
  }

}
