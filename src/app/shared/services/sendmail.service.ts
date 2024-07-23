import { Injectable } from '@angular/core';
import { Auth, sendEmailVerification } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { UserService } from './user.service';
import { DABubbleUser } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  activeUser!: DABubbleUser;

  constructor(private auth: Auth, private router: Router, private userService: UserService) {




  }

  async sendMail() {
    const user = this.auth.currentUser;

    if (user) {
      const actionCodeSettings = {
        url: 'http://localhost/?email=' + user.email,
        handleCodeInApp: true,
      };
      sendEmailVerification(user, actionCodeSettings)
        .then(() => {
          this.router.navigate(['/avatar'])
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }


  verifyMail() {

    this.userService.getUsersFromDB().then(() => {
      if (this.router.url.includes('verifyEmail')) {



        let split1 = this.router.url.split('%3Femail%3D')[1]
        let split2 = split1.split('&')[0];


        console.log(split2);
        this.userService.users.map(user => {
          if (user.mail === split2) {
            this.activeUser = user;
            if (!this.activeUser.activated) {
              this.activeUser.activated = true;

              this.userService.updateActivationStatus(this.activeUser).then(() => {
                localStorage.setItem("userLogin", this.activeUser.id? this.activeUser.id:'');
                this.userService.activeUserSubject.next(this.activeUser);
                this.userService.checkOnlineStatus();
                this.router.navigate(['/home']);
              });
            }
          }
        });
      }
    });

  }
}

