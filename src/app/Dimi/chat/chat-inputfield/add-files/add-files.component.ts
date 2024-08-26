import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';

@Component({
  selector: 'app-add-files',
  standalone: true,
  imports: [CommonModule, SafePipe],
  templateUrl: './add-files.component.html',
  styleUrl: './add-files.component.scss',
})
export class AddFilesComponent {
  @Input() addFilesImg: any;
  @Output() selectedFile = new EventEmitter<string>();
  @Output() fileName = new EventEmitter<string>();
  @Input() filePreview: any;

  fileIsImage!: boolean;
  fileIsPdf!: boolean;

  onFileSelected(event: Event): void {
    debugger;
    let input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      let file = input.files[0];
      this.fileName.emit(file.name);

      this.getFileType(file);

      let reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.selectedFile.emit(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  getFileType(file: any) {
    if (file.type === 'application/pdf') {
      this.fileIsPdf = true;
      this.fileIsImage = false;
    } else if (file.type.startsWith('image/')) {
      this.fileIsImage = true;
      this.fileIsPdf = false;
    } else {
      this.fileIsImage = false;
      this.fileIsPdf = false;
    }
  }

  //Erstmal zwischen .pdf und Bildern unterscheiden
  //Bild darf nicht größer als 500kb sein

  removeSelectedFile() {
    this.filePreview = '';
    this.selectedFile.emit(this.filePreview);
  }
}
