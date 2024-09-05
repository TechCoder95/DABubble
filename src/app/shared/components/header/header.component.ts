import { Component, HostListener, inject, Input, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { OpenProfileInfoComponent } from '../../../rabia/open-profile-info/open-profile-info.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { DABubbleUser } from '../../interfaces/user';
import { User } from 'firebase/auth';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { filter, Subscription } from 'rxjs';
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
    private mobileService: MobileService,
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

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkConditions();
      });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (window.innerWidth <= 910) {
      /* console.log('Viel Spaß beim Resizen ;-)');
      console.log(this.router.url); */

      if (this.router.url.includes('thread')) {
        this.mobileService.isMobile = true;
        this.router.navigate([
          'thread',
          JSON.parse(sessionStorage.getItem('selectedThread')!).id,
        ]);
        console.log('hier1');
      } else if (this.router.url.includes('channel')) {
        this.mobileService.isMobile = true;
        this.router.navigate([
          'channel',
          JSON.parse(sessionStorage.getItem('selectedChannel')!).id,
        ]);
        console.log('hier2');
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
        console.log('da1');
      } else if (this.router.url.includes('channel')) {
        this.mobileService.isMobile = false;
        this.router.navigate([
          'home',
          'channel',
          JSON.parse(sessionStorage.getItem('selectedChannel')!).id,
        ]);
        console.log('da2');
      }
      else {
        this.mobileService.isMobile = false;
        this.router.navigate(['home']);
        console.log('da3');
      }
    }
  }

  openMenu() {
    this.dialog.open(OpenProfileInfoComponent);
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

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler() {
    this.userService.logout();
  }

  getUrl() {
    return this.router.url;
  }

  windowIsSmall() {
    return window.innerWidth <= 910;
  }

  inChat(): boolean {
    return this.router.url.includes('channel');
  }

  inChannel: boolean = false;
  checkConditions(): void {
    if (this.windowIsSmall() && this.inChat()) {
      this.inChannel = true;
    } else {
      this.inChannel = false;
    }
  }

  backToSidenav() {
    this.mobileService.isChat = false;
    this.router.navigate(['/home']);
  }
}
