import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  activeUser = this.userService.activeUser;

  constructor(private AuthService: AuthenticationService, private userService: UserService) { 



  }

  


  logout() {
    this.AuthService.signOut();
  }

}
