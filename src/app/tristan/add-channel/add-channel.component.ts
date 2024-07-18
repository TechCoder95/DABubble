import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [MatDialogModule, MatFormField, MatLabel, FormsModule, MatInputModule, MatButtonModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})

export class AddChannelComponent {

  constructor(private dialogRef: MatDialogRef<AddChannelComponent>){
  }

  name: string = "";

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(){
     return this.name;
  }
}