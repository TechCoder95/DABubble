import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-channel-information',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './dialog-channel-information.component.html',
  styleUrl: './dialog-channel-information.component.scss',
})
export class DialogChannelInformationComponent {
  /* @ViewChild('closeButton') closeButtonRef!: ElementRef; */
  closeImg = './img/close-default.png';

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
}
