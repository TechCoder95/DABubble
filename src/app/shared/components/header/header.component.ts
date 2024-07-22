import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { OpenProfileInfoComponent } from '../../../rabia/open-profile-info/open-profile-info.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DABubbleUser } from '../../interfaces/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  activeUser!: DABubbleUser;
  public dialog = inject(MatDialog);

  searchInput: string = '';

  constructor(private AuthService: AuthenticationService, private userService: UserService, private router: Router) {

    this.userService.getUsersFromDB().then(() => {
      this.activeUser = this.userService.activeUser;
    })

   }


  openMenu() {
    this.dialog.open(OpenProfileInfoComponent)
  }

  get isLoggedIn() {
    return this.userService.isLoggedIn;
  }

  goToRegister() {
    this.router.navigate(['/addUser']);
  }


}
