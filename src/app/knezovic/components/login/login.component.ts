import { Component } from '@angular/core';
import { User } from '../../../shared/interfaces/user';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email: string = 'dominik@test.de';
  password: string = '123456789';

  constructor(private UserService: UserService, private router: Router) {

  }


  getUsers() {
    this.UserService.getUsersFromDB();
  }


  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      console.info('Form is valid');
      this.login(this.email, this.password);
    }
    else {
      console.info('Form is not valid');
      ngForm.resetForm();
    }
    this.clearInputs();
  }


  login(email: string, password: string) {
    this.UserService.login(email, password);
  }

  logout() {
    this.UserService.logout();
  }

  get allUsers() {
    return this.UserService.users;
  }


  get isLoggedIn() {
    return this.UserService.loggedInUser;
  }

  clearInputs() {
    this.email = '';
    this.password = '';
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

}
