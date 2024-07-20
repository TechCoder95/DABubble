import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { ChannelService } from '../../../../shared/services/channel.service';

@Component({
  selector: 'app-dialog-add-channel-members',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule],
  templateUrl: './dialog-add-channel-members.component.html',
  styleUrl: './dialog-add-channel-members.component.scss',
})
export class DialogAddChannelMembersComponent implements AfterViewInit {
  closeImg = './img/close-default.png';
  @ViewChild('inputName') inputName!: ElementRef;
  focusNameInput: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogAddChannelMembersComponent>,
    public channelService: ChannelService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.inputName.nativeElement.blur(), 200);
  }

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
}
