import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { LoginComponent } from "./login/login.component";
import { SidenavComponent } from "../../tristan/sidenav/sidenav.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { VariableContentComponent } from "./variable-content/variable-content.component";
import { GlobalsubService, OnlineStatus } from '../../shared/services/globalsub.service';
import { filter, Subscription, tap } from 'rxjs';
import { DABubbleUser } from '../../shared/interfaces/user';
import { User } from 'firebase/auth';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChannelService } from '../../shared/services/channel.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoginComponent, SidenavComponent, HeaderComponent, VariableContentComponent, RouterOutlet, CommonModule, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private globalSubService: GlobalsubService, private router: Router, public channelService:ChannelService) { }

  userSub!: Subscription;
  googleUserSub!: Subscription;
  onlineStatusSub!: Subscription;

  activeUser!: DABubbleUser;


  activeUserChange = new EventEmitter<DABubbleUser>();
  activeGoogleUserChange = new EventEmitter<User>();
  onlineStatusChange = new EventEmitter<String[]>();


  ngOnInit() {
    let googleUser = sessionStorage.getItem('firebase:authUser:AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE:[DEFAULT]')
    if (googleUser) {
      let googleUserObj = JSON.parse(googleUser);
      this.globalSubService.updateGoogleUser(googleUserObj);
    }

    if (!this.userSub)
      this.userSub = this.globalSubService.getUserObservable()
        .pipe()
        .subscribe(data => {
          this.activeUser = data;
          this.activeUserChange.emit(data);
        });
    if (!this.googleUserSub)
      this.googleUserSub = this.globalSubService.getGoogleUserObservable().subscribe(data => {
        this.activeGoogleUserChange.emit(data);
      });

    if (!this.onlineStatusSub)
      this.onlineStatusSub = this.globalSubService.getOnlineStatusObservable()
    .subscribe(data => {
        this.onlineStatusChange.emit(data.onlineUser);
      });

  }


  ngOnDestroy(): void {
    if (this.userSub)
      this.userSub.unsubscribe();

    if (this.googleUserSub)
      this.googleUserSub.unsubscribe();

    if (this.onlineStatusSub)
      this.onlineStatusSub.unsubscribe();
  }


  getStorage() {
    if (sessionStorage.getItem('userLogin')) {
      return true;
    }
    return false;
  }

  getLocation() {
    return this.router.url;
  }

  getRoute() {
    if (this.router.url === '/') {
      return false;
    }
    else {
      return true;
    }
  }
}
