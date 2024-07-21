import { Component } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-open-profile-card',
  standalone: true,
  imports: [MatButtonModule, CommonModule, FormsModule],
  templateUrl: './open-profile-card.component.html',
  styleUrl: './open-profile-card.component.scss'
})
export class OpenProfileCardComponent {

  activeUser = this.userService.activeUser;
  editable: boolean = false;

  constructor(private AuthService: AuthenticationService, private userService: UserService) {
  }

  saveProfile() {
    console.log(this.activeUser);
    
    this.updateProfile();
    this.editable = !this.editable;
  }

  editProfile() {
    this.editable = !this.editable;
  }

  updateProfile() {
    this.userService.updateUser(this.activeUser)
  }

}
