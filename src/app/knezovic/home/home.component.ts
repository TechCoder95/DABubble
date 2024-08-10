import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LoginComponent } from "./login/login.component";
import { UserService } from '../../shared/services/user.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { SidenavComponent } from "../../tristan/sidenav/sidenav.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { VariableContentComponent } from "./variable-content/variable-content.component";
import { Router } from '@angular/router';
import { EmailService } from '../../shared/services/sendmail.service';
import { GlobalsubService } from '../../shared/services/globalsub.service';
import { DatabaseService } from '../../shared/services/database.service';
import { Subscription } from 'rxjs';
import { DABubbleUser } from '../../shared/interfaces/user';
import { User } from 'firebase/auth';
import { TextChannel } from '../../shared/interfaces/textchannel';
import { ChatMessage } from '../../shared/interfaces/chatmessage';
import { ThreadMessage } from '../../shared/interfaces/threadmessage';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoginComponent, SidenavComponent, HeaderComponent, VariableContentComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private globalSubService: GlobalsubService, private databaseService: DatabaseService) {
    let googleUser = sessionStorage.getItem('firebase:authUser:AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE:[DEFAULT]')

    if (googleUser) {
      let googleUserObj = JSON.parse(googleUser);
      this.globalSubService.publishGoogleUser(googleUserObj);
    }

  }



  userSub!: Subscription;
  googleUserSub!: Subscription;
  allMessageSub!: Subscription;
  activeChannelSub!: Subscription;
  activeThreadSub!: Subscription;




  @Output() activeUserChange = new EventEmitter<DABubbleUser>();
  @Output() activeGoogleUserChange = new EventEmitter<User>();
  @Output() activeChannelChange = new EventEmitter<TextChannel>();
  @Output() allMessagesChange = new EventEmitter<ChatMessage>();


  activeThread!: any; // Todo Rabia



  ngOnInit() {

    this.userSub = this.globalSubService.getUserObservable().subscribe(data => {
      this.activeUserChange.emit(data);
    });

    this.googleUserSub = this.globalSubService.getGoogleUserObservable().subscribe(data => {
      this.activeGoogleUserChange.emit(data);
    });

    this.activeChannelSub = this.globalSubService.getActiveChannelObservable().subscribe(data => {
      this.activeChannelChange.emit(data);
    });

    this.allMessageSub = this.globalSubService.getAllMessageObservable().subscribe(data => {
      this.allMessagesChange.emit(data);
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

    if (this.activeChannelSub)
    this.activeChannelSub.unsubscribe();

    if (this.allMessageSub)
    this.allMessageSub.unsubscribe();

    if (this.activeThreadSub)
    this.activeThreadSub.unsubscribe();
    
    
    console.log('Unsubscribed');

  }





}
