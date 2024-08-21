import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-file-selection',
  standalone: true,
  imports: [],
  templateUrl: './file-selection.component.html',
  styleUrl: './file-selection.component.scss',
})
export class FileSelectionComponent {
  @Input() filePreview!:string | ArrayBuffer;
}
