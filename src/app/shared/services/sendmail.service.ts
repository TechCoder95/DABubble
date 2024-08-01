import { Injectable } from '@angular/core';
import { Auth, sendEmailVerification, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { applyActionCode, checkActionCode, confirmPasswordReset, getAuth, verifyPasswordResetCode } from 'firebase/auth';
import { UserService } from './user.service';
import { DABubbleUser } from '../interfaces/user';
import { DatabaseService } from './database.service';
import { AuthenticationService } from './authentication.service';
import { initializeApp } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  activeUser!: DABubbleUser;

  constructor(private auth: Auth, private router: Router, private userService: UserService, private authService: AuthenticationService) {
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
    console.log(email);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log('Email sent');
      }
      ).catch((error) => {
        console.error(error);
      });
  }



  getParameterByName(name: string, url: string) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }


  handleEmail() {
    // Get the action to complete.
    const mode = this.getParameterByName('mode', window.location.href);
    // Get the one-time code from the query parameter.
    const actionCode = this.getParameterByName('oobCode', window.location.href);
    // (Optional) Get the continue URL from the query parameter if available.
    const continueUrl = this.getParameterByName('continueUrl', window.location.href);
    // (Optional) Get the language code if available.
    const lang = this.getParameterByName('lang', window.location.href) || 'en';

    // Configure the Firebase SDK.
    // This is the minimum configuration required for the API to be used.
    const config = {
      'apiKey': "AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE" // Copy this key from the web initialization
      // snippet found in the Firebase console.
    };

    const auth = getAuth();

    // Handle the user management action.
    switch (mode) {
      case 'resetPassword':
        // Display reset password handler and UI.
        this.handleResetPassword(auth, actionCode!, continueUrl!, lang);
        break;
      case 'recoverEmail':
        // Display email recovery handler and UI.
        this.handleRecoverEmail(auth, actionCode!, lang);
        break;
      case 'verifyEmail':
        // Display email verification handler and UI.
        this.handleVerifyEmail(auth, actionCode!, continueUrl!, lang);
        break;
      default:
      // Error: invalid mode.

    };
  }






  handleResetPassword(auth: any, actionCode: string, continueUrl: string, lang: string) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.

    // Verify the password reset code is valid.
    verifyPasswordResetCode(auth, actionCode).then((email) => {
      const accountEmail = email;

      this.router.navigate(['/password-change']);

      // TODO: Show the reset screen with the user's email and ask the user for
      // the new password.
      const newPassword = "...";

      // Save the new password.
      confirmPasswordReset(auth, actionCode, newPassword).then((resp) => {
        // Password reset has been confirmed and new password updated.

        // TODO: Display a link back to the app, or sign-in the user directly
        // if the page belongs to the same domain as the app:
        // auth.signInWithEmailAndPassword(accountEmail, newPassword);

        // TODO: If a continue URL is available, display a button which on
        // click redirects the user back to the app via continueUrl with
        // additional state determined from that URL's parameters.
      }).catch((error) => {
        // Error occurred during confirmation. The code might have expired or the
        // password is too weak.
      });
    }).catch((error) => {
      // Invalid or expired action code. Ask user to try to reset the password
      // again.
    });
  }

  handleRecoverEmail(auth: any, actionCode: string, lang: string) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    let restoredEmail: any = null;
    // Confirm the action code is valid.
    checkActionCode(auth, actionCode).then((info) => {
      // Get the restored email address.
      restoredEmail = info['data']['email'];

      // Revert to the old email.
      return applyActionCode(auth, actionCode);
    }).then(() => {
      // Account email reverted to restoredEmail

      // TODO: Display a confirmation message to the user.

      // You might also want to give the user the option to reset their password
      // in case the account was compromised:
      sendPasswordResetEmail(auth, restoredEmail).then(() => {
        // Password reset confirmation sent. Ask user to check their email.
      }).catch((error) => {
        // Error encountered while sending password reset code.
      });
    }).catch((error) => {
      // Invalid code.
    });
  }

  handleVerifyEmail(auth: any, actionCode: string, continueUrl: string, lang: string) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    // Try to apply the email verification code.
    applyActionCode(auth, actionCode).then((resp) => {
      // Email address has been verified.

      // TODO: Display a confirmation message to the user.
      // You could also provide the user with a link back to the app.

      // TODO: If a continue URL is available, display a button which on
      // click redirects the user back to the app via continueUrl with
      // additional state determined from that URL's parameters.
    }).catch((error) => {
      // Code is invalid or expired. Ask the user to verify their email address
      // again.
    });
  }






}

