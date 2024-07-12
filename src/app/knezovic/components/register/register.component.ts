import { Component } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  email:string = '';
  password:string = '';
  username:string = '';

  constructor(private UserService:UserService) {}

  register(email:string, password:string, username:string) {
    this.UserService.register(email, password, username);
    this.clearInputs();
  }

  getUsers() {
    this.UserService.getUsersFromDB();
  }

  clearInputs() {
    this.email = '';
    this.password = '';
    this.username = '';
  }
}
