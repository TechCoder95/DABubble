import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { OpenProfileInfoComponent } from '../../../rabia/open-profile-info/open-profile-info.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DABubbleUser } from '../../interfaces/user';
import { isLoggedIn } from '../../guards/authguard.guard';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  activeUser!: DABubbleUser;
  activeGoogleUser!: User;
  public dialog = inject(MatDialog);

  searchInput: string = '';

  constructor(private AuthService: AuthenticationService, private userService: UserService, private router: Router) {

    this.userService.activeUserObserver$.subscribe((user: DABubbleUser) => {
      if(window.location.pathname !== '/user/chooseAvatar') {
      this.activeUser = user;
      }
    });

    this.userService.activeGoogleUserObserver$.subscribe((user: User) => {
      if(window.location.pathname !== '/user/chooseAvatar') {
        this.activeGoogleUser = user;
        }
    });


  }

  openMenu() {
    this.dialog.open(OpenProfileInfoComponent)
  }

  goToRegister() {
    this.router.navigate(['/user/register']);
  }

}
