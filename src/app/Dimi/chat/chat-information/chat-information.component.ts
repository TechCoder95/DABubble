import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogChannelInformationComponent } from './dialog-channel-information/dialog-channel-information.component';

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
  dialogIsOpen: boolean = false;

  constructor(public dialog: MatDialog) {}

  changeTagImg(hover: boolean) {
    if (hover || this.dialogIsOpen) {
      this.tagImg = './img/tag-hover.png';
      this.arrowImg = './img/arrow-down-hover.png';
    } else {
      this.tagImg = './img/tag.png';
      this.arrowImg = './img/keyboard_arrow_down.png';
    }
  }

  openChannelInformation(event: MouseEvent) {
    this.dialogIsOpen = !this.dialogIsOpen;
    this.changeTagImg(this.dialogIsOpen);
    const dialogConfig = this.handleDialogConfig(event);
    const dialogRef = this.dialog.open(
      DialogChannelInformationComponent,
      dialogConfig
    );
    this.handleDialogClose(dialogRef);
  }

  handleDialogConfig(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const dialogConfig = {
      position: {
        top: `${rect.bottom}px`,
        left: `${rect.left}px`,
      },
      panelClass: 'custom-dialog-container',
      data: { dialogIsOpen: this.dialogIsOpen },
    };
    return dialogConfig;
  }

  handleDialogClose(dialogRef: any) {
    dialogRef.afterClosed().subscribe((result: boolean) => {
      this.dialogIsOpen = result;
      this.changeTagImg(this.dialogIsOpen);
    });
  }
}
