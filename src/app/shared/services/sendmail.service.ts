import { Injectable } from '@angular/core';
import { Auth, sendEmailVerification, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { UserService } from './user.service';
import { DABubbleUser } from '../interfaces/user';
import { DatabaseService } from './database.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  activeUser!: DABubbleUser;

  constructor(private auth: Auth, private router: Router, private userService: UserService, private authService : AuthenticationService) {


   

    
  }


  /**
   * Sends an email verification link to the current user.
   * If the user is authenticated, it sends an email verification link to the user's email address.
   * After sending the email, it navigates the user to the chooseAvatar page.
   */
  async sendMail() {
    const user = this.auth.currentUser;
    if (user) {
      const actionCodeSettings = {
        url: 'http://localhost/?email=' + user.email,
        handleCodeInApp: true,
      };
      sendEmailVerification(user, actionCodeSettings)
        .then(() => {
          this.router.navigate(['/user/chooseAvatar'])
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }


  /**
   * Verifies the email of the user.
   * Retrieves users from the database and checks if the current URL contains 'verifyEmail'.
   * If the email in the URL matches a user's email, updates the activation status of the user and performs additional actions.
   * Navigates to the home page after the verification process is complete.
   */
  // verifyMail() {
  //   this.userService.getUsersFromDB().then(() => {
  //     if (this.router.url.includes('verifyEmail')) {
  //       let split1 = this.router.url.split('%3Femail%3D')[1]
  //       let split2 = split1.split('&')[0];
  //       this.userService.users.map(user => {
  //         if (user.mail === split2) {
  //           this.activeUser = user;
  //           if (!this.activeUser.activated) {
  //             this.activeUser.activated = true;
  //             this.userService.updateActivationStatus(this.activeUser).then(() => {
  //               localStorage.setItem("userLogin", this.activeUser.id ? this.activeUser.id : '');
  //               this.userService.activeUserSubject.next(this.activeUser);
  //               this.userService.checkOnlineStatus(this.activeUser);
  //               this.router.navigate(['/home']);
  //             });
  //           }
  //           else {
  //             this.router.navigate(['/home']);
  //           }
  //         }
  //       });
  //     }
  //     else if (this.router.url.includes('resetPassword')) {
  //       let split1 = this.router.url.split('%3Femail%3D')[1]
  //       let split2 = split1.split('&')[0];
  //       this.userService.users.map(user => {
  //         if (user.mail === split2) {
  //           this.activeUser = user;
  //           this.router.navigate(['/password-change']);
  //         }
  //       });
  //     }
  //   });

  // }





  changePassword(email: string) {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log('Email sent');
      }
      ).catch((error) => {
        console.error(error);
      });
  }

}

