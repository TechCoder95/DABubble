import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { EmojisPipe } from '../../../../../shared/pipes/emojis.pipe';
import { HtmlConverterPipe } from "../../../../../shared/pipes/html-converter.pipe";
import { VerlinkungPipe } from "../../../../../shared/pipes/verlinkung.pipe";
import { DAStorageService } from '../../../../../shared/services/dastorage.service';
import express from 'express';
import cors from 'cors';

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

  constructor(private storage: DAStorageService) {}

  imageExists() {
    return (
      this.receiveMessage.fileUrl && this.receiveMessage.fileUrl.trim() !== ''
    );
  }

  /* async downloadFile() {
    await this.storage
      .getDownloadURL(this.receiveMessage.fileUrl!)
      .then((url) => {
        debugger;
        console.log(url);
        
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          let blob = xhr.response;
        };
        xhr.open('GET', url);
        xhr.send();
      })
      .catch((error) => {
        console.error(error);
      });
  } */




  async downloadFile() {

    this.storage.downloadFile(this.receiveMessage.fileUrl!, this.receiveMessage.fileName!)


    /* try {
      const url = await this.storage.getDownloadURL(
        this.receiveMessage.fileUrl!,
      );
      console.log(url);

      const response = await fetch(url);
      debugger;
      console.log(response);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();

      const link = document.createElement('a');
      const objectURL = URL.createObjectURL(blob);
      link.href = objectURL;
      link.download = this.receiveMessage.fileName || 'downloaded-file';
      link.click();
      URL.revokeObjectURL(objectURL); // Bereinige das Objekt-URL
    } catch (error) {
      console.error('Error downloading the file:', error);
    } */
  }
}
/* function cors(arg0: {}): any {
  throw new Error('Function not implemented.');
} */

