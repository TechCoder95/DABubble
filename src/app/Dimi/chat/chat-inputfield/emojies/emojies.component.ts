import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmojiSelectionComponent } from './emoji-selection/emoji-selection.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emojies',
  standalone: true,
  imports: [EmojiSelectionComponent, CommonModule],
  templateUrl: './emojies.component.html',
  styleUrl: './emojies.component.scss',
})
export class EmojiesComponent {
  @Input() addEmojiImg!: string;
  @Output() selectedEmoji = new EventEmitter<string>();
  emojiSelectionOn: boolean = false;

  handleEmojiSelection() {
    this.emojiSelectionOn = !this.emojiSelectionOn;
  }

  handleSelectedEmoji(event: string) {
    this.selectedEmoji.emit(event);
    this.emojiSelectionOn = false;
  }
}
