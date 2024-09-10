import { Component, HostListener, inject, Input, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { OpenProfileInfoComponent } from '../../../rabia/open-profile-info/open-profile-info.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DABubbleUser } from '../../interfaces/user';
import { User } from 'firebase/auth';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { MobileService } from '../../services/mobile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchbarComponent],
  providers: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  public dialog = inject(MatDialog);

  searchInput: string = '';

  url: string = window.location.pathname;
  route: string = this.url.split('/')[1];

  userSub!: Subscription;
  googleUserSub!: Subscription;

  constructor(
    public AuthService: AuthenticationService,
    private router: Router,
    private userService: UserService,
    public mobileService: MobileService,
  ) {}

  activeUser!: DABubbleUser;
  activeGoogleUser!: User;

  @Input() activeUserChange!: any;
  @Input() activeGoogleUserChange!: any;

  ngOnInit() {
    if (window.location.pathname != '/user/login') {
      this.activeUser = this.userService.activeUser;
      this.activeUserChange.subscribe((user: DABubbleUser) => {
        this.activeUser = user;
      });

      this.activeGoogleUser = this.userService.googleUser;
      this.activeGoogleUserChange.subscribe((user: User) => {
        this.activeGoogleUser = user;
      });
    }
  }

  /**
   * Checks the current route and adjusts the mobileService and router navigation accordingly.
   * If the window width is less than or equal to 910 pixels:
   *   - If the current route includes 'thread', sets mobileService.isMobile to true and navigates to the selected thread.
   *   - If the current route includes 'channel', sets mobileService.isMobile to true, checks the conditions, and navigates to the selected channel.
   * If the window width is greater than 910 pixels:
   *   - If the current route includes 'thread', sets mobileService.isMobile to false and navigates to the selected thread within the home channel.
   *   - If the current route includes 'channel', sets mobileService.isMobile to false and navigates to the selected channel within the home channel.
   *   - If the current route includes 'home', sets mobileService.isMobile to false and navigates to the home page.
   */
  checkRoute() {
    if (window.innerWidth <= 1250) {
      if (this.router.url.includes('thread')) {
        this.mobileService.isMobile = true;
        this.router.navigate([
          'thread',
          JSON.parse(sessionStorage.getItem('selectedThread')!).id,
        ]);
      } else if (this.router.url.includes('channel')) {
        this.mobileService.isMobile = true;

        this.checkConditions();
        this.router.navigate([
          'channel',
          JSON.parse(sessionStorage.getItem('selectedChannel')!).id,
        ]);
      }
    } else {
      if (this.router.url.includes('thread')) {
        this.mobileService.isMobile = false;
        this.router.navigate([
          'home',
          'channel',
          JSON.parse(sessionStorage.getItem('selectedChannel')!).id,
          'thread',
          JSON.parse(sessionStorage.getItem('selectedThread')!).id,
        ]);
      } else if (this.router.url.includes('channel')) {
        this.mobileService.isMobile = false;
        this.router.navigate([
          'home',
          'channel',
          JSON.parse(sessionStorage.getItem('selectedChannel')!).id,
        ]);
      } else if (this.router.url.includes('home')) {
        this.mobileService.isMobile = false;
        this.router.navigate(['home']);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkRoute();
  }

  /**
   * Opens the menu and displays the OpenProfileInfoComponent.
   */
  openMenu() {
    this.dialog.open(OpenProfileInfoComponent);
  }

  /**
   * Navigates to the registration page.
   */
  goToRegister() {
    this.AuthService.registerProcess = true;
    this.router.navigate(['/user/register']);
  }

  /**
   * Checks if the user is logged in as a guest.
   * @returns {boolean} Returns true if the user is logged in as a guest, otherwise returns false.
   */
  checkGuest() {
    if (sessionStorage.getItem('userLoginGuest')) {
      return true;
    } else {
      return false;
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  /**
   * Handles the unload event.
   * Calls the `logout` method of the `userService`.
   */
  unloadHandler() {
    this.userService.logout();
  }

  /**
   * Retrieves the current URL.
   * 
   * @returns The current URL.
   */
  getUrl() {
    return this.router.url;
  }

  /**
   * Determines if the window size is considered small.
   * @returns {boolean} True if the window size is small, false otherwise.
   */
  windowIsSmall() {
    return window.innerWidth <= 1250;
  }

  /**
   * Checks if the current route contains the word 'channel'.
   * @returns {boolean} Returns true if the current route contains 'channel', otherwise returns false.
   */
  inChat(): boolean {
    return this.router.url.includes('channel');
  }

  inChannel: boolean = false;
  /**
   * Checks the conditions to determine if the component is in the channel.
   */
  checkConditions(): void {
    if (this.windowIsSmall() && this.inChat()) {
      this.inChannel = true;
    } else {
      this.inChannel = false;
    }
  }

  /**
   * Navigates back to the sidenav.
   */
  backToSidenav() {
    this.mobileService.isChat = false;
    this.router.navigate(['/home']);
  }
}
