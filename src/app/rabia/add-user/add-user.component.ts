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
import { UserService } from '../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatCheckboxModule, FormsModule, MatButtonModule, MatDialogModule, CommonModule, MatTooltipModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {

  user = {
    username: '',
    mail: '',
    password: ''
  }

  acceptPolicy = false;
  readonly dialog = inject(MatDialog);


  constructor(private UserService: UserService, private router: Router, private AuthService : AuthenticationService) { }


  register(mail: string, password: string, username: string) {
    this.AuthService.MailSignUp(mail, password, username);
    this.acceptPolicy = true;
  }

  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      console.info('Form is valid');
      this.register(this.user.mail, this.user.password, this.user.username);
      this.getUsers();
    }
    else {
      console.info('Form is not valid');
      ngForm.resetForm();
    }
  }

  getUsers() {
    this.UserService.getUsersFromDB();

    if (this.UserService.users.length > 0) {
      const lastUser = this.UserService.users[this.UserService.users.length - 1];
    } else {
      console.log("Das Array ist leer.");
    }
  }

  goToLogin() {
    this.router.navigate(['/user/login']);
  }

  // checkFields() {
  //   this.acceptPolicy = this.user.fullName !== '' && this.user.email !== '' && this.user.password !== '';
  // }

}
