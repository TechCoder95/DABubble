import { Injectable } from '@angular/core';
import {
  Auth,
  sendEmailVerification,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  applyActionCode,
  confirmPasswordReset,
  getAuth,
  verifyBeforeUpdateEmail,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { UserService } from './user.service';
import { DABubbleUser } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  activeUser!: DABubbleUser;
  accountEmail: string = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private userService: UserService,
  ) {}

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
        .catch((error) => {
          console.error(error);
        });
    }
  }

  /**
   * Sends a password reset email to the specified email address.
   *
   * @param email - The email address to send the password reset email to.
   */
  changePassword(email: string) {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * Retrieves the value of a query parameter from a given URL.
   * @param name - The name of the query parameter to retrieve.
   * @param url - The URL to search for the query parameter. If not provided, the current window location will be used.
   * @returns The value of the query parameter, or null if it doesn't exist.
   */
  getParameterByName(name: string, url: string) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  /**
   * Handles the email action based on the mode parameter.
   * Retrieves necessary parameters from the URL and performs the corresponding action.
   */
  handleEmail() {
    const mode = this.getParameterByName('mode', window.location.href);
    const actionCode = this.getParameterByName('oobCode', window.location.href);
    if (actionCode !== null) sessionStorage.setItem('actionCode', actionCode);
    const continueUrl = this.getParameterByName(
      'continueUrl',
      window.location.href,
    );
    const lang = this.getParameterByName('lang', window.location.href) || 'en';
    const config = { apiKey: 'AIzaSyCyX84ckP7Gy77ZkfrLaW1NYgFSBWc7-Y8' };
    const auth = getAuth();
    switch (mode) {
      case 'resetPassword':
        this.router.navigate(['/user/password-change']);
        break;
      case 'verifyEmail':
        this.handleVerifyEmail(auth, actionCode!, continueUrl!, lang);
        break;
      case 'verifyAndChangeEmail':
        this.handleVerifyEmail(auth, actionCode!, continueUrl!, lang);
        break;
      default:
      // Error: invalid mode.
    }
  }

  /**
   * Handles the password reset process.
   *
   * @param password - The new password to be set.
   */
  handleResetPassword(password: string) {
    if (sessionStorage.getItem('actionCode')) {
      verifyPasswordResetCode(this.auth, sessionStorage.getItem('actionCode')!)
        .then((email) => {
          this.accountEmail = email as string;
          confirmPasswordReset(
            this.auth,
            sessionStorage.getItem('actionCode')!,
            password,
          )
            .then((resp) => {})
            .catch((error) => {});
        })
        .catch((error) => {});
    }
  }

  /**
   * Handles the verification of email using the provided action code.
   *
   * @param auth - The authentication object.
   * @param actionCode - The action code for email verification.
   * @param continueUrl - The URL to redirect the user after successful verification.
   * @param lang - The language code for localizing the UI.
   */
  handleVerifyEmail(
    auth: any,
    actionCode: string,
    continueUrl: string,
    lang: string,
  ) {
    applyActionCode(auth, actionCode)
      .then((resp) => {
        if (sessionStorage.getItem('userLogin'))
          this.router.navigate(['/home']);
        else this.router.navigate(['/user/login']);
      })
      .catch((error) => console.error(error));
  }

  /**
   * Updates the Google email for the current user.
   *
   * @param email - The new email address to update.
   */
  updateGoogleEmail(email: string) {
    const auth = getAuth();
    verifyBeforeUpdateEmail(auth.currentUser!, email)
      .then(() => {
        this.userService.logout();
      })
      .catch((error) => {});
  }
}
