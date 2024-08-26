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
  /* selectedUsers: DABubbleUser[] = []; */

  openWindow() {
    this.linkWindowOpen = !this.linkWindowOpen;
    if (this.linkWindowOpen) {
      this.setCheckboxesForSelectedUsers();
    }
  }

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

  getAllUsersSelectedCheckbox() {
    return document.querySelector(
      '.select-all-usernames input[type="checkbox"]',
    ) as HTMLInputElement;
  }

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

  getCheckbox(event: Event) {
    return (event.currentTarget as HTMLElement).querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
  }

  deleteUserFromArray(user: DABubbleUser) {
    let index = this.linkedUsers.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.linkedUsers.splice(index, 1);
    }
  }

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

  getAllCheckboxes() {
    return Array.from(
      document.querySelectorAll('.username-checkbox input[type="checkbox"]'),
    ) as HTMLInputElement[];
  }

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

  removeLinkedUser(index: number) {
    if (index === 12345) {
      this.linkedUsers = [];
    } else {
      this.linkedUsers.splice(index, 1);
      this.linkWindowOpen = false;
    }
  }
}
