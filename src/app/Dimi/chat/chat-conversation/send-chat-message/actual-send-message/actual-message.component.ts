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
  imports: [
    CommonModule,
    EmojisPipe,
    HtmlConverterPipe,
    VerlinkungPipe,
    SafePipe,
  ],
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

  /**
   * Checks if a sent image exists.
   *
   * @returns {boolean} Returns true if a sent image exists, otherwise false.
   */
  sentImageExists() {
    if (!this.sendMessage?.fileUrl || this.sendMessage.fileUrl.trim() === '') {
      return false;
    }
    let imageExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
    return imageExtensions.some((ext) =>
      this.sendMessage.fileUrl?.toLowerCase().endsWith(ext),
    );
  }

  /**
   * Checks if a PDF file is attached to the message being sent.
   *
   * @returns {boolean} True if a PDF file is attached, false otherwise.
   */
  sentPdfExists() {
    if (!this.sendMessage?.fileUrl || this.sendMessage.fileUrl.trim() === '') {
      return false;
    }
    return this.sendMessage.fileUrl.toLowerCase().endsWith('.pdf');
  }

  /**
   * Checks if a message exists.
   *
   * @returns {boolean} True if the message exists, false otherwise.
   */
  messageExists() {
    return this.sendMessage.message && this.sendMessage.message.trim() !== '';
  }
}
