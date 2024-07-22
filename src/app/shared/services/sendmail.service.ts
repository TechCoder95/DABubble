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
    if (this.router.url.includes('verifyEmail')) {

      this.userService.getUsersFromDB().then(() => {

        this.userService.users.find((user) => {
          if (user.mail === this.auth.currentUser?.email) {
            this.activeUser = user;
            const url = this.router.url;
            const apiKey = url.split('?apiKey=')[1];
            if (apiKey && !this.activeUser.activated) {
              this.activeUser.activated = true;
              this.userService.updateUser(this.activeUser);
            }
          }
        });
      });

    }
  }


}
