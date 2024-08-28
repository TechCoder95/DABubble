import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { EmojisPipe } from '../../../../../shared/pipes/emojis.pipe';
import { ChatMessage } from '../../../../../shared/interfaces/chatmessage';
import { HtmlConverterPipe } from '../../../../../shared/pipes/html-converter.pipe';
import { VerlinkungPipe } from '../../../../../shared/pipes/verlinkung.pipe';
import { SafePipe } from '../../../../../shared/pipes/safe.pipe';

@Component({
  selector: 'app-actual-message',
  standalone: true,
  imports: [CommonModule, EmojisPipe, HtmlConverterPipe, VerlinkungPipe, SafePipe],
  templateUrl: './actual-message.component.html',
  styleUrl: './actual-message.component.scss',
})
export class ActualMessageComponent implements OnInit {
  @Input() sendMessage!: ChatMessage;
  @Input() sentFile!: string;

  ngOnInit(): void {
    this.sentImageExists();
    this.sentPdfExists();
  }

  sentImageExists() {
    if (!this.sendMessage?.fileUrl || this.sendMessage.fileUrl.trim() === '') {
      return false;
    }
    let imageExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
    return imageExtensions.some((ext) =>
      this.sendMessage.fileUrl?.toLowerCase().endsWith(ext),
    );
  }

  sentPdfExists() {
    if (!this.sendMessage?.fileUrl || this.sendMessage.fileUrl.trim() === '') {
      return false;
    }
    return this.sendMessage.fileUrl.toLowerCase().endsWith('.pdf');
  }

  messageExists() {
    return this.sendMessage.message && this.sendMessage.message.trim() !== '';
  }
}
