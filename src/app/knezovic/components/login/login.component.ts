import { Component } from '@angular/core';
import { User } from '../../../shared/interfaces/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';

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

  constructor(private UserService: UserService) {

  }


  getUsers() {
    this.UserService.getUsersFromDB();
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

}
