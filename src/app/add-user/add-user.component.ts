import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { User } from '../models/user.class';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatCheckboxModule, FormsModule, MatButtonModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {
  user = new User();
  acceptPolicy = false;

  saveUser() {
    console.log(this.user);
  }

  // checkFields() {
  //   this.acceptPolicy = this.user.fullName !== '' && this.user.email !== '' && this.user.password !== '';
  // }

}
