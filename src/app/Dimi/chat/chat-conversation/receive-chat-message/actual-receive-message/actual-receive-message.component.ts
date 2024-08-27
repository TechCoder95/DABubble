import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { CommonModule } from '@angular/common';
import { EmojisPipe } from '../../../../../shared/pipes/emojis.pipe';

@Component({
  selector: 'app-actual-receive-message',
  standalone: true,
  imports: [CommonModule, EmojisPipe],
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

  downloadImage(imageUrl: string) {
    debugger;

    let format!: string | undefined;

    if (this.receiveMessage.fileName) {
      format = this.receiveMessage.fileName.split('.').pop()?.toLowerCase();
    }
    console.log(format);
    

    const newBlob = new Blob([imageUrl], { type: `image/${format}` });
    const data = window.URL.createObjectURL(newBlob);
    const link = document.createElement('a');
    link.href = data;
    if (this.receiveMessage.fileName) {
      link.download = this.receiveMessage.fileName;
    }
    link.click();
  }

  /*   downloadImage(imageUrl: string) {
    debugger;
    const mimeTypes: { [key: string]: string } = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      svg: 'image/svg+xml',
    };

    let format!: string | undefined;
    // Extrahiere das Dateiformat aus der URL
    if (this.receiveMessage.fileName) {
      format = this.receiveMessage.fileName.split('.').pop()?.toLowerCase();
      if (!format || !(format in mimeTypes)) {
        console.error('Unsupported image format');
        return;
      }
    }

    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        if (format) {
          const newBlob = new Blob([blob], { type: mimeTypes[format] });
          const data = window.URL.createObjectURL(newBlob);
          const link = document.createElement('a');
          link.href = data;
          link.download = this.receiveMessage.fileName
            ? `${this.receiveMessage.fileName}.${format}`
            : `download.${format}`;
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(data);
        }
      })
      .catch((error) => console.error('Error downloading the image:', error));
  } */
}
