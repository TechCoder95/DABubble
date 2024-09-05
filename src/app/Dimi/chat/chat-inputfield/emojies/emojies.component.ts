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

  /**
   * Toggles the emoji selection state.
   */
  handleEmojiSelection() {
    this.emojiSelectionOn = !this.emojiSelectionOn;
  }

  /**
   * Handles the selection of an emoji.
   *
   * @param event - The selected emoji.
   */
  handleSelectedEmoji(event: string) {
    this.selectedEmoji.emit(event);
    this.emojiSelectionOn = false;
  }
}
