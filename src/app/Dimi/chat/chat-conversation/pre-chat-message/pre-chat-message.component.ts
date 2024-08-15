import { Component } from '@angular/core';
import { ChatService } from '../../../../shared/services/chat.service';
import { UserService } from '../../../../shared/services/user.service';
import { ChannelService } from '../../../../shared/services/channel.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pre-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pre-chat-message.component.html',
  styleUrl: './pre-chat-message.component.scss',
})
export class PreChatMessageComponent {
  activeUser!: DABubbleUser;
  isPrivateChat!: boolean;
  isChatWithMyself!: boolean;
  privateChatPartner!: DABubbleUser | undefined;
  channelName!: string | undefined;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private channelService: ChannelService
  ) {
    this.activeUser = userService.activeUser;
    this.isPrivateChat = channelService.channel.isPrivate;
    this.declareIsChatWithMyself();
    this.getPrivateChatPartner();
    this.getChannelName();
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

  declareIsChatWithMyself() {
    if (
      this.isPrivateChat &&
      this.channelService.channel.assignedUser.length === 1
    ) {
      this.isChatWithMyself = true;
    }
  }
}
