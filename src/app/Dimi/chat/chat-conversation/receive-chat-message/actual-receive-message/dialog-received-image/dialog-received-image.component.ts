import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  receivedImgMessage: string;
}

@Component({
  selector: 'app-dialog-received-image',
  standalone: true,
  imports: [],
  templateUrl: './dialog-received-image.component.html',
  styleUrl: './dialog-received-image.component.scss',
})
export class DialogReceivedImageComponent {
  image: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.image = data.receivedImgMessage;
  }
}
