import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DABubbleUser } from '../../../../shared/interfaces/user';

@Component({
  selector: 'app-link-channel-member',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './link-channel-member.component.html',
  styleUrl: './link-channel-member.component.scss',
})
export class LinkChannelMemberComponent {
  @Input() usersInChannel!: DABubbleUser[];
  @Input() addLinkImg!: string;
  @Input() linkedUsers!: DABubbleUser[];
  @Output() users = new EventEmitter<DABubbleUser[]>();
  linkWindowOpen: boolean = false;

  /**
   * Toggles the state of the link window and sets checkboxes for selected users if the link window is open.
   */
  openWindow() {
    this.linkWindowOpen = !this.linkWindowOpen;
    if (this.linkWindowOpen) {
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
        if (this.linkedUsers.some((user) => user.id === userID)) {
          checkbox.checked = true;
          /* this.selectedUsers.push(user); */
        } else {
          checkbox.checked = false;
        }
      });
      /* this.selectedUsers = this.linkedUsers; */
      if (this.linkedUsers.length === this.usersInChannel.length) {
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
  toggleUsername(event: Event, user: DABubbleUser) {
    event.stopPropagation();
    let checkbox = this.getCheckbox(event);
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        this.linkedUsers.push(user);
      } else {
        this.deleteUserFromArray(user);
      }
    }
    this.users.emit(this.linkedUsers);
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
  deleteUserFromArray(user: DABubbleUser) {
    let index = this.linkedUsers.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.linkedUsers.splice(index, 1);
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

      this.linkedUsers = [];

      this.usersInChannel.forEach((user) => {
        this.linkedUsers.push(user);
      });
    }
    this.users.emit(this.linkedUsers);
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
    let user: DABubbleUser | undefined = this.usersInChannel.find(
      (u) => u.id === userId,
    );
    if (user) {
      if (isChecked) {
        if (!this.linkedUsers.some((u) => u.id === user.id)) {
          this.linkedUsers.push(user);
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
      this.linkedUsers = [];
    } else {
      this.linkedUsers.splice(index, 1);
      this.linkWindowOpen = false;
    }
  }
}
