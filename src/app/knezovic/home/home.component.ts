import { Component, Input, OnInit } from '@angular/core';
import { LoginComponent } from "./login/login.component";
import { UserService } from '../../shared/services/user.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { SidenavComponent } from "../../tristan/sidenav/sidenav.component";
import { ChatComponent } from "../../Dimi/chat/chat.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoginComponent, SidenavComponent, ChatComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {


  constructor(private UserService: UserService, private AuthService: AuthenticationService) { }

    
  get isLoggedIn() {
    return this.UserService.isLoggedIn;
  }
}
