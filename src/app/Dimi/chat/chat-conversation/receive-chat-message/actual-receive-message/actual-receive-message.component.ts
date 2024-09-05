import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { EmojisPipe } from '../../../../../shared/pipes/emojis.pipe';
import { HtmlConverterPipe } from '../../../../../shared/pipes/html-converter.pipe';
import { VerlinkungPipe } from '../../../../../shared/pipes/verlinkung.pipe';
import { DAStorageService } from '../../../../../shared/services/dastorage.service';
import express from 'express';
import cors from 'cors';
import { MatDialog } from '@angular/material/dialog';
import { DialogReceivedImageComponent } from './dialog-received-image/dialog-received-image.component';

@Component({
  selector: 'app-actual-receive-message',
  standalone: true,
  imports: [CommonModule, EmojisPipe, HtmlConverterPipe, VerlinkungPipe],
  templateUrl: './actual-receive-message.component.html',
  styleUrl: './actual-receive-message.component.scss',
})
export class ActualReceiveMessageComponent {
  @Input() receiveMessage!: ChatMessage;
  @Input() receivedImgMessage!: string;
  @Input() repeatedMessage!: boolean | undefined;

  constructor(public dialog: MatDialog) {}

  imageExists() {
    return (
      this.receiveMessage.fileUrl && this.receiveMessage.fileUrl.trim() !== ''
    );
  }

  openImageInDialog() {
    this.dialog.open(DialogReceivedImageComponent, {
      data: { receivedImgMessage: this.receivedImgMessage },
    });
  }
}
