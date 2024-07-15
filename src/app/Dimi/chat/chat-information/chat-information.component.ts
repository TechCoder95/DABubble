import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogChannelInformationComponent } from './dialog-channel-information/dialog-channel-information.component';
import { ComponentType } from '@angular/cdk/portal';
import { DialogChannelMembersComponent } from './dialog-channel-members/dialog-channel-members.component';
import { DialogAddChannelMembersComponent } from './dialog-add-channel-members/dialog-add-channel-members.component';

@Component({
  selector: 'app-chat-information',
  standalone: true,
  imports: [CommonModule, MatDialogModule, DialogChannelInformationComponent],
  templateUrl: './chat-information.component.html',
  styleUrl: './chat-information.component.scss',
})
export class ChatInformationComponent {
  isChannel: boolean = true;
  tagImg = './img/tag.png';
  arrowImg = './img/keyboard_arrow_down.png';
  tagImgClass = '';
  dialogChannelInfoIsOpen: boolean = false;
  addChannelMembersImg = './img/add-members-default.png';

  constructor(public dialog: MatDialog) {}

  changeTagImg(hover: boolean) {
    if (hover || this.dialogChannelInfoIsOpen) {
      this.tagImg = './img/tag-hover.png';
      this.arrowImg = './img/arrow-down-hover.png';
    } else {
      this.tagImg = './img/tag.png';
      this.arrowImg = './img/keyboard_arrow_down.png';
    }
  }

  changeAddMembersImg(hover: boolean) {
    if (hover) {
      this.addChannelMembersImg = './img/add-members-hover.png';
    } else {
      this.addChannelMembersImg = './img/add-members-default.png';
    }
  }

  openDialogChannelInformation(event: MouseEvent) {
    this.dialogChannelInfoIsOpen = !this.dialogChannelInfoIsOpen;
    if (this.dialogChannelInfoIsOpen) {
      document.body.style.overflow = 'hidden';
    }
    this.changeTagImg(this.dialogChannelInfoIsOpen);
    const dialogConfig = this.handleDialogConfig(event, 'fromLeft');
    const dialogRef = this.dialog.open(
      DialogChannelInformationComponent,
      dialogConfig
    );
    this.handleDialogClose(dialogRef);
  }

  dialogChannelMembersIsOpen: boolean = false;
  openDialogChannelMembers(event: MouseEvent) {
    this.dialogChannelMembersIsOpen = !this.dialogChannelMembersIsOpen;
    if (this.dialogChannelMembersIsOpen) {
      document.body.style.overflow = 'hidden';
    }
    const dialogConfig = this.handleDialogConfig(event, 'fromRight');
    const dialogRef = this.dialog.open(
      DialogChannelMembersComponent,
      dialogConfig
    );
    this.handleDialogClose(dialogRef);
  }

  dialogAddChannelMembersIsOpen: boolean = false;
  openDialogAddChannelMembers(event: MouseEvent) {
    /*  this.dialogAddChannelMembersIsOpen = !this.dialogAddChannelMembersIsOpen;
    if (this.dialogAddChannelMembersIsOpen) {
      document.body.style.overflow = 'hidden';
    } */

    this.dialog.open(DialogAddChannelMembersComponent);
  }

  handleDialogConfig(event: MouseEvent, position: string) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    let dialogConfig = this.returnDialogConfig(rect, position);
    return dialogConfig;
  }

  returnDialogConfig(rect: any, position: string) {
    if (position === 'fromLeft') {
      return {
        position: {
          top: `${rect.bottom}px`,
          left: `${rect.left}px`,
        },
        panelClass: 'custom-dialog-container',
        /*   data: { dialogIsOpen: this.dialogChannelInfoIsOpen }, */
      };
    } else {
      const dialogWidth = 380;
      return {
        position: {
          top: `${rect.bottom}px`,
          left: `${rect.right - dialogWidth}px`, // Berechnet die linke Position, sodass die rechten Ränder übereinstimmen
        },
        panelClass: 'custom-dialog-container',
        data: { channelMembers: this.channelMembers },
      };
    }
  }

  handleDialogClose(dialogRef: any) {
    dialogRef.afterClosed().subscribe((result: boolean) => {
      this.dialogChannelInfoIsOpen = result;
      this.dialogChannelMembersIsOpen = result;
      document.body.style.overflow = '';
      this.changeTagImg(this.dialogChannelInfoIsOpen);
    });
  }

  channelMembers = [
    {
      img: './img/member1.png',
      name: 'Dimitrios Kapetanis (Du)',
    },
    {
      img: './img/member2.png',
      name: 'Rabia Ürkmez',
    },
    {
      img: './img/member3.png',
      name: 'Dominik Knezovic',
    },
    {
      img: './img/member4.png',
      name: 'Tristan Gehring',
    },
  ];
}
