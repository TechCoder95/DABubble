import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { TextChannel } from '../../../../shared/interfaces/textchannel';

@Component({
  selector: 'app-link-channel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './link-channel.component.html',
  styleUrl: './link-channel.component.scss',
})
export class LinkChannelComponent {
  @Input({required:true}) ChannelsFromUser!: TextChannel[];
  @Input() addLinkImg!: string;
  @Input({required:true}) linkedChannel!: TextChannel[];
  @Output() users = new EventEmitter<TextChannel[]>();
  @Input({required:true}) linkChannelWindowOpen: boolean = false;
  @Output() linkChannelWindowOpenChange = new EventEmitter<boolean>();

  /**
   * Toggles the state of the link window and sets checkboxes for selected users if the link window is open.
   */
  openWindow() {
    this.linkChannelWindowOpen = !this.linkChannelWindowOpen;
    if (this.linkChannelWindowOpen) {
      this.setCheckboxesForSelectedUsers();
    }
  }

  /**
   * Sets the checkboxes for the selected users.
   * This function is responsible for checking or unchecking the checkboxes based on the linked users.
   * It also checks the "All Users Selected" checkbox if all users are linked.
   * Note: This function uses a setTimeout with a delay of 100 milliseconds.
   */
  setCheckboxesForSelectedUsers() {
    setTimeout(() => {
      let checkboxes = this.getAllCheckboxes();
      /*  this.selectedUsers = []; */
      checkboxes.forEach((checkbox: HTMLInputElement) => {
        let userID = checkbox.getAttribute('id');
        if (this.linkedChannel.some((user) => user.id === userID)) {
          checkbox.checked = true;
          /* this.selectedUsers.push(user); */
        } else {
          checkbox.checked = false;
        }
      });
      /* this.selectedUsers = this.linkedUsers; */
      if (this.linkedChannel.length === this.ChannelsFromUser.length) {
        let allUsersSelectedCheckbox = this.getAllUsersSelectedCheckbox();
        allUsersSelectedCheckbox.checked = true;
      }
    }, 100);
  }

  /**
   * Retrieves the checkbox element for selecting all users.
   *
   * @returns The HTMLInputElement representing the checkbox element.
   */
  getAllUsersSelectedCheckbox() {
    return document.querySelector(
      '.select-all-usernames input[type="checkbox"]',
    ) as HTMLInputElement;
  }

  /**
   * Toggles the username for a given user.
   *
   * @param event - The event that triggered the toggle.
   * @param user - The user whose username is being toggled.
   */
  toggleUsername(event: Event, user: TextChannel) {
    event.stopPropagation();
    let checkbox = this.getCheckbox(event);
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        this.linkedChannel.push(user);
      } else {
        this.deleteUserFromArray(user);
      }
    }
    this.users.emit(this.linkedChannel);
  }

  /**
   * Retrieves the checkbox element from the given event.
   *
   * @param event - The event object.
   * @returns The checkbox element.
   */
  getCheckbox(event: Event) {
    return (event.currentTarget as HTMLElement).querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
  }

  /**
   * Deletes a user from the linkedUsers array.
   *
   * @param user - The user to be deleted.
   */
  deleteUserFromArray(user: TextChannel) {
    let index = this.linkedChannel.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.linkedChannel.splice(index, 1);
    }
  }

  /**
   * Toggles the selection of all usernames in the chat input field.
   *
   * @param event - The event object triggered by the user action.
   */
  toggleAllUsernames(event: Event) {
    event.stopPropagation();
    let checkboxToSelectAll = this.getCheckbox(event);

    if (checkboxToSelectAll) {
      checkboxToSelectAll.checked = !checkboxToSelectAll.checked;
      let isChecked = checkboxToSelectAll.checked;

      let checkboxes = this.getAllCheckboxes();

      checkboxes.forEach((checkbox: HTMLInputElement) => {
        checkbox.checked = isChecked;
      });

      this.linkedChannel = [];

      this.ChannelsFromUser.forEach((user) => {
        this.linkedChannel.push(user);
      });
    }
    this.users.emit(this.linkedChannel);
  }

  /**
   * Retrieves all the checkboxes with the class 'username-checkbox' and the input type 'checkbox'.
   *
   * @returns An array of HTMLInputElement representing the checkboxes.
   */
  getAllCheckboxes() {
    return Array.from(
      document.querySelectorAll('.username-checkbox input[type="checkbox"]'),
    ) as HTMLInputElement[];
  }

  /**
   * Handles the checkbox state change for each checkbox element.
   *
   * @param checkbox - The HTMLInputElement representing the checkbox.
   * @param isChecked - A boolean indicating whether the checkbox is checked or not.
   */
  handleEachCheckbox(checkbox: HTMLInputElement, isChecked: boolean) {
    let userId = checkbox.getAttribute('id');
    let user: TextChannel | undefined = this.ChannelsFromUser.find(
      (u) => u.id === userId,
    );
    if (user) {
      if (isChecked) {
        if (!this.linkedChannel.some((u) => u.id === user.id)) {
          this.linkedChannel.push(user);
        }
      } else {
        this.deleteUserFromArray(user);
      }
    }
  }

  /**
   * Removes a linked user from the linkedUsers array.
   *
   * @param index - The index of the linked user to remove.
   */
  removeLinkedUser(index: number) {
    if (index === 12345) {
      this.linkedChannel = [];
    } else {
      this.linkedChannel.splice(index, 1);
      this.linkChannelWindowOpen = false;
    }
  }

  setChannel(event: Event, channel: TextChannel) {
    event.stopPropagation();
    this.linkedChannel = [channel];
    this.users.emit(this.linkedChannel);
    this.linkChannelWindowOpen = false;
    this.linkChannelWindowOpenChange.emit(this.linkChannelWindowOpen);
  }
}
