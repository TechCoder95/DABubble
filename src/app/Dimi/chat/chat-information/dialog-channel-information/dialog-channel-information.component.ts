import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../../shared/services/channel.service';
import { map, Observable } from 'rxjs';

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
    CommonModule,
  ],
  templateUrl: './dialog-channel-information.component.html',
  styleUrl: './dialog-channel-information.component.scss',
})
export class DialogChannelInformationComponent {
  closeImg = './img/close-default.png';
  channelName: string = 'Entwicklerteam';
  /* TO EDIT NAME */
  @ViewChild('editChannelNameSection') editChannelNameSection!: ElementRef;
  @ViewChild('editName') editButton!: ElementRef;
  @ViewChild('title1') title1!: ElementRef;
  @ViewChild('channelName') channelNameDiv!: ElementRef;
  @ViewChild('channelNameInput') ChannelNameInput!: ElementRef;
  @ViewChild('updatedChannelName') updatedChannelName!: ElementRef;
  /* TO EDIT DESCRIPTION */
  @ViewChild('editChannelDescriptionSection')
  editChannelDescriptionSection!: ElementRef;
  @ViewChild('editDescription') editDescriptionButton!: ElementRef;
  @ViewChild('title2') title2!: ElementRef;
  @ViewChild('channelDescription') channelDescriptionDiv!: ElementRef;
  @ViewChild('channelCreator') channelCreator!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<DialogChannelInformationComponent>,
    public channelService: ChannelService
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

  inEditModeName: boolean = false;
  editChannelName() {
    if (!this.inEditModeName) {
      this.inEditModeName = true;
      this.editChannelNameSection.nativeElement.classList.add(
        'edit-mode-channel-name-section'
      );
      this.editButton.nativeElement.textContent = 'Speichern';
      this.editButton.nativeElement.classList.add('edit-mode');
      this.title1.nativeElement.classList.add('edit-mode-title');
      this.channelNameDiv.nativeElement.classList.add('edit-mode-channel-name');
    } else {
      debugger;
      let updatedName = this.updatedChannelName.nativeElement.value;
      this.saveNewChannelName(updatedName);
      this.inEditModeName = false;
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

  saveNewChannelName(updatedName: string) {
    this.channelService.updateChannelName(updatedName);
  }

  inEditModeDescription: boolean = false;
  editChannelDescription() {
    if (!this.inEditModeDescription) {
      this.inEditModeDescription = true;
      this.editChannelDescriptionSection.nativeElement.classList.add(
        'edit-mode-channel-description-section'
      );
      this.editDescriptionButton.nativeElement.textContent = 'Speichern';
      this.editDescriptionButton.nativeElement.classList.add('edit-mode');
      this.title2.nativeElement.classList.add('edit-mode-title');
      this.channelDescriptionDiv.nativeElement.style.marginTop = '20px';
      this.channelDescriptionDiv.nativeElement.style.width = '465px';
      this.channelDescriptionDiv.nativeElement.classList.add(
        'edit-mode-channel-name'
      );
      this.channelCreator.nativeElement.style.paddingBottom = '20px';
    } else {
      this.inEditModeDescription = false;
      this.editChannelDescriptionSection.nativeElement.classList.remove(
        'edit-mode-channel-description-section'
      );
      this.editDescriptionButton.nativeElement.textContent = 'Bearbeiten';
      this.editDescriptionButton.nativeElement.classList.remove('edit-mode');
      this.title2.nativeElement.classList.remove('edit-mode-title');
      this.channelDescriptionDiv.nativeElement.style.marginTop = '0';
      this.channelDescriptionDiv.nativeElement.style.width = 'unset';
      this.channelDescriptionDiv.nativeElement.classList.remove(
        'edit-mode-channel-name'
      );
      this.channelCreator.nativeElement.style.paddingBottom = '0';
    }
  }

  get placeholderText(): Observable<string> {
    return this.channelService.selectedChannel$.pipe(
      map((channel: any) => `${channel?.name || 'Channel'}`)
    );
  }
}
