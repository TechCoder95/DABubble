import { Component } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../../shared/interfaces/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {


  user: User = {
    mail: '',
    password: '',
    username: ''
  };


  constructor(private UserService: UserService, private router: Router) { }

  register(user: User) {
    this.UserService.register(user.mail, user.password, user.username);
    this.goToLogin();
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

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
