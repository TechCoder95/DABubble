import { Injectable } from '@angular/core';
import { Auth, sendEmailVerification, sendPasswordResetEmail, updateEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { applyActionCode, AuthCredential, checkActionCode, confirmPasswordReset, getAuth, verifyBeforeUpdateEmail, verifyPasswordResetCode } from 'firebase/auth';
import { UserService } from './user.service';
import { DABubbleUser } from '../interfaces/user';
import { DatabaseService } from './database.service';
import { AuthenticationService } from './authentication.service';
import { initializeApp } from 'firebase/app';
import { reauthenticateWithCredential } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  activeUser!: DABubbleUser;

  constructor(private auth: Auth, private router: Router, private userService: UserService) {
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
    if (actionCode !== null)
      sessionStorage.setItem('actionCode', actionCode);
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
        this.router.navigate(['/user/password-change']);
        break;
      case 'verifyEmail':
        // Display email verification handler and UI.
        this.handleVerifyEmail(auth, actionCode!, continueUrl!, lang);
        break;
      case 'verifyAndChangeEmail':
        // Display email verification handler and UI.
        this.handleVerifyEmail(auth, actionCode!, continueUrl!, lang);
        break;
      default:
      // Error: invalid mode.

    };
  }


  accountEmail: string = '';

  handleResetPassword(password: string) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.

    // Verify the password reset code is valid.
    if (sessionStorage.getItem('actionCode')) {
      verifyPasswordResetCode(this.auth, sessionStorage.getItem('actionCode')!).then((email) => {
        this.accountEmail = email as string;
        // TODO: Show the reset screen with the user's email and ask the user for
        // the new password.

        // Save the new password.
        confirmPasswordReset(this.auth, sessionStorage.getItem('actionCode')!, password).then((resp) => {
          // Password reset has been confirmed and new password updated.
          console.log('Password reset successful');
          console.log();

        }).catch((error) => {
          // Error occurred during confirmation. The code might have expired or the
          // password is too weak.
        });
      }).catch((error) => {
        // Invalid or expired action code. Ask user to try to reset the password
        // again.
      });
    }
  }


  handleVerifyEmail(auth: any, actionCode: string, continueUrl: string, lang: string) {
    // Localize the UI to the selected language as determined by the lang
    // parameter.
    // Try to apply the email verification code.
    applyActionCode(auth, actionCode).then((resp) => {
      if (localStorage.getItem('userLogin'))
        this.router.navigate(['/home']);
      else
        this.router.navigate(['/user/login'])
    }).catch((error) =>
      console.error(error)
    );
  }


  updateGoogleEmail(email: string) {
    const auth = getAuth();
    verifyBeforeUpdateEmail(auth.currentUser!, email).then(() => {

      this.userService.logout();

    }).catch((error) => {
      // An error ocurred
      // ...
    });

  }
}

