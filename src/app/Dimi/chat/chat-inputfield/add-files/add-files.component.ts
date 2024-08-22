import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-files',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-files.component.html',
  styleUrl: './add-files.component.scss',
})
export class AddFilesComponent {
  @Input() addFilesImg: any;
  @Output() selectedFile = new EventEmitter<string | ArrayBuffer>();
  @Output() fileName = new EventEmitter<string>();
  @Input() filePreview: any;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.fileName.emit(file.name);
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.filePreview = e.target.result;
          this.selectedFile.emit(this.filePreview);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile() {
    this.filePreview = '';
    this.selectedFile.emit(this.filePreview);
  }
}
