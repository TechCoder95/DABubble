import { Component, Input, OnInit } from '@angular/core';
import { LoginComponent } from "./login/login.component";
import { UserService } from '../../shared/services/user.service';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {


  constructor(private UserService: UserService, private AuthService: AuthenticationService) { }

}
