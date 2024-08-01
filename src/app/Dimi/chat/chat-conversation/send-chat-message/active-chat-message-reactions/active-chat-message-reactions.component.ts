import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Emoji } from '../../../../../shared/interfaces/emoji';
import { UserService } from '../../../../../shared/services/user.service';
import { DatabaseService } from '../../../../../shared/services/database.service';
import { DABubbleUser } from '../../../../../shared/interfaces/user';

@Component({
  selector: 'app-active-chat-message-reactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-chat-message-reactions.component.html',
  styleUrl: './active-chat-message-reactions.component.scss',
})
export class ActiveChatMessageReactionsComponent {
  @Input() emojiType!: string;
  @Input() sendMessage!: any;
  @Input() user!: DABubbleUser;
  activeUser!: DABubbleUser;

  constructor(
    private userService: UserService,
    private databaseService: DatabaseService
  ) {
    this.activeUser = this.user;
   /*  this.onEmojiChange(this.emojiType); */
  }






  async onEmojiChange(emojiType: string) {
    //Überprüfen, ob es in der DB schon Documents mit der gleichen messageID,EMOJITYPE & vom activeUser gibt
    let emojiesFromDb: Emoji[] = [];
    await this.databaseService.readDatafromDB('emojies', emojiesFromDb);
    debugger;
    const emojiExistsOnMessage = emojiesFromDb.some(
      (emojie) =>
        emojie.messageId === this.sendMessage.id && emojie.type === emojiType
    );

    const userExistsOnEmoji = emojiesFromDb.some(
      (emojie) =>
        emojie.messageId === this.sendMessage.id &&
        emojie.type === emojiType &&
        emojie.usersIds.includes(this.activeUser.id!)
    );

    if (userExistsOnEmoji) {
      console.log('JA, HAB SCHON REAGIERT');
    }

    if (!emojiExistsOnMessage) {
      this.addEmojiToMessage(emojiType);
    } else {
      this.addUserToEmoji();
    }
  }

  addUserToEmoji() {}

  async addEmojiToMessage(emojiType: string) {
    if (this.activeUser.id) {
      let reaction: Emoji = {
        messageId: this.sendMessage.id!,
        type: emojiType,
        usersIds: [this.activeUser.id],
      };
      const newEmojiId = await this.databaseService.addChannelDataToDB(
        'emojies',
        reaction
      );
      reaction.id = newEmojiId;

      await this.databaseService.addDataToDB('emojies', reaction);
      debugger;
      console.log(reaction.id);
      /* await this.databaseService.addMessageToChannel(this.sendMessage.id,); */
      /* await this.databaseService. */
      debugger;
    }
  }
}
