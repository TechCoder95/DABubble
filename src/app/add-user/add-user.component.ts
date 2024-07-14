import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from './../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { User } from './../shared/interfaces/user';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatCheckboxModule, FormsModule, MatButtonModule, MatDialogModule, CommonModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {

  user: User = {
    mail: '',
    password: '',
    username: '',
    
  };

  acceptPolicy = false;
  readonly dialog = inject(MatDialog);


  constructor(private UserService: UserService, private router: Router) {
    
  }


  register(user: User) {
    this.UserService.register(user.mail, user.password, user.username);
    this.acceptPolicy = true;
    this.openAvatar();
  }

  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      console.info('Form is valid');
      this.register(this.user);
    }
    else {
      console.info('Form is not valid');
      ngForm.resetForm();
    }
  }

  getUsers() {
    this.UserService.getUsersFromDB();
  }

  
  openAvatar() {
    console.log(this.user);
    this.router.navigateByUrl('/avatar')
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // checkFields() {
  //   this.acceptPolicy = this.user.fullName !== '' && this.user.email !== '' && this.user.password !== '';
  // }

}
