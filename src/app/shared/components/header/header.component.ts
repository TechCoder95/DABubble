import { Component, inject, Input, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { OpenProfileInfoComponent } from '../../../rabia/open-profile-info/open-profile-info.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DABubbleUser } from '../../interfaces/user';
import { User } from 'firebase/auth';
import { SearchbarComponent } from "./searchbar/searchbar.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchbarComponent],
  providers: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  public dialog = inject(MatDialog);

  searchInput: string = '';

  url: string = window.location.pathname;
  route: string = this.url.split('/')[1];


  userSub!: Subscription;
  googleUserSub!: Subscription;

  constructor(public AuthService: AuthenticationService, private router: Router) { }

  activeUser!: DABubbleUser;
  activeGoogleUser!: User;


  @Input() activeUserChange!: any;
  @Input() activeGoogleUserChange!: any;

  ngOnInit() {

    if (window.location.pathname != '/user/login') {
      this.activeUserChange.subscribe((user: DABubbleUser) => {
        this.activeUser = user;
      });

      this.activeGoogleUserChange.subscribe((user: User) => {
        this.activeGoogleUser = user;
      });

    }
  }

  openMenu() {
    this.dialog.open(OpenProfileInfoComponent)
  }


  goToRegister() {
    this.AuthService.registerProcess = true;
    this.router.navigate(['/user/register']);
  }


  checkGuest() {
    if (sessionStorage.getItem('userLoginGuest')) {
      return true;
    } else {
      return false;
    }
  }

}
