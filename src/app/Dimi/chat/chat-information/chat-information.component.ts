import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogChannelInformationComponent } from './dialog-channel-information/dialog-channel-information.component';
import { ComponentType } from '@angular/cdk/portal';
import { DialogChannelMembersComponent } from './dialog-channel-members/dialog-channel-members.component';

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
    const dialogConfig = this.handleDialogConfig(event, 'fromRight');
    this.dialog.open(DialogChannelMembersComponent, dialogConfig);
  }

  handleDialogConfig(event: MouseEvent, position: string) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    let dialogConfig = this.returnDialogConfig(rect, position);
    return dialogConfig;
  }

  returnDialogConfig(rect: any, position: string) {
    let dialogConfig;
    if (position === 'fromLeft') {
      return (dialogConfig = {
        position: {
          top: `${rect.bottom}px`,
          left: `${rect.left}px`,
        },
        panelClass: 'custom-dialog-container',
        /*   data: { dialogIsOpen: this.dialogChannelInfoIsOpen }, */
      });
    } else {
      const dialogWidth = 280;
      return (dialogConfig = {
        position: {
          top: `${rect.bottom}px`,
          left: `${rect.right - dialogWidth}px`, // Berechnet die linke Position, sodass die rechten Ränder übereinstimmen
        },
        panelClass: 'custom-dialog-container',
      });
    }
  }

  handleDialogClose(dialogRef: any) {
    dialogRef.afterClosed().subscribe((result: boolean) => {
      this.dialogChannelInfoIsOpen = result;
      this.dialogChannelMembersIsOpen = result;
      this.changeTagImg(this.dialogChannelInfoIsOpen);
    });
  }
}
