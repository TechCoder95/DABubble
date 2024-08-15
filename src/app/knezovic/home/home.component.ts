import { Component, EventEmitter, Input, OnDestroy, OnInit} from '@angular/core';
import { LoginComponent } from "./login/login.component";
import { SidenavComponent } from "../../tristan/sidenav/sidenav.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { VariableContentComponent } from "./variable-content/variable-content.component";
import { GlobalsubService } from '../../shared/services/globalsub.service';
import { Subscription } from 'rxjs';
import { DABubbleUser } from '../../shared/interfaces/user';
import { User } from 'firebase/auth';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoginComponent, SidenavComponent, HeaderComponent, VariableContentComponent, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private globalSubService: GlobalsubService) {
    let googleUser = sessionStorage.getItem('firebase:authUser:AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE:[DEFAULT]')

    if (googleUser) {
      let googleUserObj = JSON.parse(googleUser);
      this.globalSubService.updateGoogleUser(googleUserObj);
    }
  }


  userSub!: Subscription;
  googleUserSub!: Subscription;
  activeThreadSub!: Subscription;

  activeUserChange = new EventEmitter<DABubbleUser>();
  activeGoogleUserChange = new EventEmitter<User>();

  activeThread!: any; // Todo Rabia



  ngOnInit() {

    if (!this.userSub)
      this.userSub = this.globalSubService.getUserObservable().subscribe(data => {
        this.activeUserChange.emit(data);
      });
    if (!this.googleUserSub)
      this.googleUserSub = this.globalSubService.getGoogleUserObservable().subscribe(data => {
        this.activeGoogleUserChange.emit(data);
      });
   




    // Todo Rabia
    // this.activeThreadSub = this.globalSubService.getActiveThreadObservable().subscribe(data => {
    //   console.log('Active Thread:', data);
    // });
  }


  ngOnDestroy(): void {
    if (this.userSub)
      this.userSub.unsubscribe();

    if (this.googleUserSub)
      this.googleUserSub.unsubscribe();


    if (this.activeThreadSub)
      this.activeThreadSub.unsubscribe();
  }

}
