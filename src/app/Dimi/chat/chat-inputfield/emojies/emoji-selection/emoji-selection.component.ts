import { Component, EventEmitter, Output } from '@angular/core';
import { EmojisPipe } from '../../../../../shared/pipes/emojis.pipe';

@Component({
  selector: 'app-emoji-selection',
  standalone: true,
  imports: [EmojisPipe],
  templateUrl: './emoji-selection.component.html',
  styleUrl: './emoji-selection.component.scss',
})
export class EmojiSelectionComponent {
  @Output() selectedEmoji = new EventEmitter<string>();

  /**
   * Emits the selected emoji.
   *
   * @param emoji - The selected emoji.
   */
  putEmojiOut(emoji: string) {
    this.selectedEmoji.emit(emoji);
  }
}
