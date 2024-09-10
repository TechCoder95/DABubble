import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { LoginComponent } from './login/login.component';
import { SidenavComponent } from '../../tristan/sidenav/sidenav.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { VariableContentComponent } from './variable-content/variable-content.component';
import {
  GlobalsubService,
  OnlineStatus,
} from '../../shared/services/globalsub.service';
import { filter, Subscription, tap } from 'rxjs';
import { DABubbleUser } from '../../shared/interfaces/user';
import { User } from 'firebase/auth';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChannelService } from '../../shared/services/channel.service';
import { MobileService } from '../../shared/services/mobile.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    LoginComponent,
    SidenavComponent,
    HeaderComponent,
    VariableContentComponent,
    RouterOutlet,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  @HostBinding('class.small-screen-channel') isSmallScreenChannel = false;
  routerEventsSub: any;

  constructor(
    private globalSubService: GlobalsubService,
    private router: Router,
    public channelService: ChannelService,
    public mobileService: MobileService,
  ) {}

  userSub!: Subscription;
  googleUserSub!: Subscription;
  onlineStatusSub!: Subscription;

  activeUser!: DABubbleUser;

  activeUserChange = new EventEmitter<DABubbleUser>();
  activeGoogleUserChange = new EventEmitter<User>();
  onlineStatusChange = new EventEmitter<String[]>();

  ngOnInit() {
    let googleUser = sessionStorage.getItem(
      'firebase:authUser:AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE:[DEFAULT]',
    );
    if (googleUser) {
      let googleUserObj = JSON.parse(googleUser);
      this.globalSubService.updateGoogleUser(googleUserObj);
    }

    if (!this.userSub)
      this.userSub = this.globalSubService
        .getUserObservable()
        .pipe()
        .subscribe((data) => {
          this.activeUser = data;
          this.activeUserChange.emit(data);
        });
    if (!this.googleUserSub)
      this.googleUserSub = this.globalSubService
        .getGoogleUserObservable()
        .subscribe((data) => {
          this.activeGoogleUserChange.emit(data);
        });

    if (!this.onlineStatusSub)
      this.onlineStatusSub = this.globalSubService
        .getOnlineStatusObservable()
        .subscribe((data) => {
          this.onlineStatusChange.emit(data.onlineUser);
        });

    this.checkConditions();
    window.addEventListener('resize', this.checkConditions.bind(this));
    this.routerEventsSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkConditions();
      });
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();

    if (this.googleUserSub) this.googleUserSub.unsubscribe();

    if (this.onlineStatusSub) this.onlineStatusSub.unsubscribe();

    if (this.routerEventsSub) this.routerEventsSub.unsubscribe();
  }

  /**
   * Checks if the 'userLogin' item exists in the sessionStorage.
   *
   * @returns {boolean} Returns true if the 'userLogin' item exists in the sessionStorage, otherwise returns false.
   */
  getStorage() {
    if (sessionStorage.getItem('userLogin')) {
      return true;
    }
    return false;
  }

  /**
   * Retrieves the current location of the router.
   *
   * @returns The URL of the current location.
   */
  getLocation() {
    return this.router.url;
  }

  /**
   * Returns a boolean value indicating whether the current route is the root route or not.
   *
   * @returns {boolean} True if the current route is not the root route, false otherwise.
   */
  getRoute() {
    if (this.router.url === '/') {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Determines if the current route is the home route.
   *
   * @returns {boolean} True if the current route is '/home', false otherwise.
   */
  getHome() {
    if (this.router.url === '/home') {
      return true;
    }
    return false;
  }

  /**
   * Checks if the window width is less than 1250px and if the current URL includes 'channel'.
   * Sets the `isSmallScreenChannel` property accordingly.
   */
  checkConditions(): void {
    this.isSmallScreenChannel =
      window.innerWidth < 1250 && this.router.url.includes('channel');
  }
}
