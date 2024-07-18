import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  activeUser = this.userService.activeUser;

  constructor(private AuthService: AuthenticationService, private userService: UserService) { 



  }

  


  logout() {
    this.AuthService.signOut();
  }

}
