import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-channel-information',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
  ],
  templateUrl: './dialog-channel-information.component.html',
  styleUrl: './dialog-channel-information.component.scss',
})
export class DialogChannelInformationComponent {
  @ViewChild('editChannelNameSection') editChannelNameSection!: ElementRef;
  @ViewChild('editName') editButton!: ElementRef;
  @ViewChild('title1') title1!: ElementRef;
  @ViewChild('channelName') channelNameDiv!: ElementRef;
  @ViewChild('channelNameInput') ChannelNameInput!: ElementRef;
  closeImg = './img/close-default.png';
  channelName: string = 'Entwicklerteam';

  constructor(
    public dialogRef: MatDialogRef<DialogChannelInformationComponent>
  ) {}

  changeCloseImg(hover: boolean) {
    if (hover) {
      this.closeImg = './img/close-hover.png';
    } else {
      this.closeImg = './img/close-default.png';
    }
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  inEditMode: boolean = false;
  editModeName() {
    if (!this.inEditMode) {
      this.inEditMode = true;
      this.editChannelNameSection.nativeElement.classList.add(
        'edit-mode-channel-name-section'
      );
      this.editButton.nativeElement.textContent = 'Speichern';
      this.editButton.nativeElement.classList.add('edit-mode');
      this.title1.nativeElement.classList.add('edit-mode-title');
      this.channelNameDiv.nativeElement.classList.add('edit-mode-channel-name');
    } else {
      this.inEditMode = false;
      this.editChannelNameSection.nativeElement.classList.remove(
        'edit-mode-channel-name-section'
      );
      this.editButton.nativeElement.textContent = 'Bearbeiten';
      this.editButton.nativeElement.classList.remove('edit-mode');
      this.title1.nativeElement.classList.remove('edit-mode-title');
      this.channelNameDiv.nativeElement.classList.remove(
        'edit-mode-channel-name'
      );
    }
  }
}
