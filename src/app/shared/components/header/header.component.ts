import { Component, HostListener, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';
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
export class HeaderComponent implements OnInit, OnDestroy {

  public dialog = inject(MatDialog);

  searchInput: string = '';

  url: string = window.location.pathname;
  route: string = this.url.split('/')[1];


  userSub!: Subscription;
  googleUserSub!: Subscription;

  constructor(public AuthService: AuthenticationService, private userService: UserService, private router: Router) {

    this.activeGoogleUser = JSON.parse(sessionStorage.getItem('firebase:authUser:AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE:[DEFAULT]')!);
    this.activeUser = this.userService.activeUser;
    


  }


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



  ngOnDestroy(): void {
    // console.log('header userunsub&googleUser zeile 36');

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
