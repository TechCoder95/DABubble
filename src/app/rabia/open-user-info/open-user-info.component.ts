import { Component, Inject, inject, Input } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-open-user-info',
  standalone: true,
  imports: [MatButtonModule, CommonModule, FormsModule],
  templateUrl: './open-user-info.component.html',
  styleUrl: './open-user-info.component.scss'
})
export class OpenUserInfoComponent {

  readonly dialogRef = inject(MatDialogRef<OpenUserInfoComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public userService: UserService) {
    
  }


  close() {
    this.dialogRef.close();
  }
}
