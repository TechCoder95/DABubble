import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DABubbleUser } from '../../../../shared/interfaces/user';

@Component({
  selector: 'app-link-channel-member',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './link-channel-member.component.html',
  styleUrl: './link-channel-member.component.scss',
})
export class LinkChannelMemberComponent {
  @Input() usersInChannel: DABubbleUser[] = [];
  @Input() addLinkImg!: string;
  @Output() users = new EventEmitter<DABubbleUser[]>();
  linkWindowOpen: boolean = false;

  openWindow() {
    this.linkWindowOpen = !this.linkWindowOpen;
  }

  selectedUsers: DABubbleUser[] = [];
  toggleUsername(event: Event, user: DABubbleUser) {
    event.stopPropagation();
    let checkbox = this.getCheckbox(event);
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        this.selectedUsers.push(user);
      } else {
        this.deleteUserFromArray(user);
      }
    }
    this.users.emit(this.selectedUsers);
    /*  this.selectedUsers = []; */
  }

  getCheckbox(event: Event) {
    return (event.currentTarget as HTMLElement).querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
  }

  deleteUserFromArray(user: DABubbleUser) {
    let index = this.selectedUsers.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.selectedUsers.splice(index, 1);
    }
  }

   toggleAllUsernames(event: Event) {
    event.stopPropagation();
    let checkboxToSelectAll = this.getCheckbox(event);
  
    if (checkboxToSelectAll) {
      checkboxToSelectAll.checked = !checkboxToSelectAll.checked;
      let isChecked = checkboxToSelectAll.checked;
  
      let checkboxes = Array.from(
        document.querySelectorAll('.username-checkbox input[type="checkbox"]'),
      ) as HTMLInputElement[];
  
      checkboxes.forEach((checkbox: HTMLInputElement) => {
        checkbox.checked = isChecked;
        debugger;
        const userId = checkbox.getAttribute('id');
        if (userId) {
          const user = this.usersInChannel.find((u) => u.id === userId);
          if (user) {
            if (isChecked) {
              if (!this.selectedUsers.some((u) => u.id === user.id)) {
                this.selectedUsers.push(user);
              }
            } else {
              this.deleteUserFromArray(user);
            }
          }
        }
      });
    }
    debugger;
    console.log(this.selectedUsers);
    
    this.users.emit(this.selectedUsers);
  }

  /*   toggleAllUsernames(event: Event) {
    event.stopPropagation();
    let checkboxToSelectAll = this.getCheckbox(event);

    if (checkboxToSelectAll) {
      checkboxToSelectAll.checked = !checkboxToSelectAll.checked;
      let isChecked = checkboxToSelectAll.checked;

      let checkboxes = Array.from(
        document.querySelectorAll('.username-checkbox input[type="checkbox"]'),
      ) as HTMLInputElement[];

      debugger;

      checkboxes.forEach((checkbox: HTMLInputElement) => {
        checkbox.checked = isChecked;
        const user = checkbox
          .closest('.username-checkbox')
          ?.querySelector('p')?.textContent;
        if (user) {
          if (isChecked) {
            this.selectedUsers.push(us);
          } else {
            this.selectedUsernames.delete(username);
          }
        }
        console.log(this.selectedUsers);
      });
    }
    this.users.emit(this.selectedUsers);
  } */
}
