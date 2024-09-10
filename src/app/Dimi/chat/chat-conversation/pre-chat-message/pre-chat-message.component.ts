import { Component, Input } from '@angular/core';
import { UserService } from '../../../../shared/services/user.service';
import { ChannelService } from '../../../../shared/services/channel.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { CommonModule } from '@angular/common';
import { TextChannel } from '../../../../shared/interfaces/textchannel';
import { Subscription } from 'rxjs';
import { GlobalsubService } from '../../../../shared/services/globalsub.service';

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
  userSubscription!: Subscription;

  @Input({ required: true }) activeChannelFromChatconv!: any;

  selectedChannel: TextChannel = JSON.parse(
    sessionStorage.getItem('selectedChannel')!,
  );

  constructor(
    private userService: UserService,
    private channelService: ChannelService,
    private subscriptionService: GlobalsubService
  ) {
    this.isPrivateChat = this.selectedChannel.isPrivate;
    if (this.isPrivateChat && this.selectedChannel.assignedUser.length === 1) {
      this.isChatWithMyself = true;
    } else {
      this.isChatWithMyself = false;
    }
    this.getChannelName();
    this.getPrivateChatPartner();

    this.userSubscription = this.subscriptionService.getUserObservable().subscribe(async (user) => {
      this.activeUser = user;
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /**
   * Retrieves the channel name.
   * If the chat is not a private chat, it sets the channel name based on the channel service's channel name.
   */
  getChannelName() {
    if (!this.isPrivateChat) {
      this.channelName = this.channelService.channel.name;
    }
  }

  /**
   * Retrieves the private chat partner for the current chat conversation.
   *
   * @returns {Promise<void>} A promise that resolves when the private chat partner is retrieved.
   */
  async getPrivateChatPartner() {
    if (this.isPrivateChat && !this.isChatWithMyself) {
      const privateChatPartnerID = this.selectedChannel.assignedUser.find(
        (userID) => userID !== this.userService.activeUser.id,
      );

      if (privateChatPartnerID) {
        this.privateChatPartner =
          await this.userService.getOneUserbyId(privateChatPartnerID);
      }
    }
  }
}
