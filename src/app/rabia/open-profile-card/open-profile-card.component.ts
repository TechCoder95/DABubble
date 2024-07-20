import { Component } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-open-profile-card',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  templateUrl: './open-profile-card.component.html',
  styleUrl: './open-profile-card.component.scss'
})
export class OpenProfileCardComponent {

  activeUser = this.userService.activeUser;

  constructor(private AuthService: AuthenticationService, private userService: UserService) {
  }
}
