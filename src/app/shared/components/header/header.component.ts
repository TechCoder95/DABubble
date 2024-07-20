import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  activeUser = this.userService.activeUser;
  searchInput: string = '';

  constructor(private AuthService: AuthenticationService, private userService: UserService, private router: Router) { 



  }

  


  logout() {
    this.AuthService.signOut();
  }

  get isLoggedIn() {
    return this.userService.isLoggedIn;
  }

  goToRegister(){
    this.router.navigate(['/addUser']);
  }

}
