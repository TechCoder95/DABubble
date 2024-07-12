import { Component } from '@angular/core';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { User } from '../../../shared/interfaces/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private AuthService: AuthenticationService) {
   
  }


  getUsers() {
    this.AuthService.getUsersFromDB();
  }

  login(email: string, password: string) {
    console.log(email);
    console.log(password);
    this.AuthService.login(email, password);
  }

  logout() {
    this.AuthService.logout();
  }

  register(email: string, password: string, username: string) {
    this.AuthService.register(email, password,username);
  }

  updateUser(user: User) {
    this.AuthService.updateUser(user);
  }

  deleteUser(userID: string) {
    this.AuthService.deleteUser(userID);
  }

  get user() {
    return this.AuthService.users;
  }

  get isLoggedIn() {
    return this.AuthService.loggedInUser;
  }

}
