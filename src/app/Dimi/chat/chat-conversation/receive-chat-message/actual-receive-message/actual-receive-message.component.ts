import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { EmojisPipe } from '../../../../../shared/pipes/emojis.pipe';
import { HtmlConverterPipe } from "../../../../../shared/pipes/html-converter.pipe";
import { VerlinkungPipe } from "../../../../../shared/pipes/verlinkung.pipe";

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

  imageExists() {
    return (
      this.receiveMessage.fileUrl && this.receiveMessage.fileUrl.trim() !== ''
    );
  }

  /* downloadImage(imageUrl: string) {
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = proxyUrl + imageUrl;
    
      fetch(targetUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'downloaded-image.jpg'; // Sie können hier jeden beliebigen Dateinamen verwenden
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error downloading the image:', error));
    } */

}
