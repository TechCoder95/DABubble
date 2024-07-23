import { EventEmitter, Injectable, Output } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, getRedirectResult, User } from "firebase/auth";
import { DatabaseService } from './database.service';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { DABubbleUser } from '../interfaces/user';
import { EmailService } from './sendmail.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private userService: UserService, private router: Router, private emailService : EmailService) { }

  auth = getAuth();
  provider = new GoogleAuthProvider();

  //#region [Mail Authentication]

  /**
   * Signs up a user with email and password, and performs additional registration and login operations.
   * @param email - The email address of the user.
   * @param password - The password of the user.
   * @param username - The username of the user.
   */
  MailSignUp(email: string, password: string, username: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed up 
        this.userService.googleUser = userCredential.user
        this.userService.register(email, username, this.userService.googleUser.uid);
        localStorage.setItem("uId", this.userService.googleUser.uid);
        this.userService.login(this.userService.googleUser).then(() => {
          this.emailService.sendMail();
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  }

  /**
   * Signs in a user with email and password.
   * 
   * @param email - The user's email address.
   * @param password - The user's password.
   */
  async mailSignIn(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed in 
        this.userService.googleUser = userCredential.user;
        this.userService.login(userCredential.user).then(() => {
          this.router.navigate(['/home']);
        });
        // ...
      })
      .catch((error) => {
        if (error.code === "auth/too-many-requests") {
          alert("User wurde gesperrt, bitte versuchen Sie es später erneut");
        }
        else if (error.code === "auth/invalid-credential") {
          alert("Falsches Passwort");
        }
        else if (error.code === "auth/invalid-email") {
          alert("E-Mail-Adresse existiert nicht");
        }
        else {
          alert("Falsche Eingabe" + error.message);
        }
      });
  }

  //#endregion

  //#region [Google Authentication]

  //Google Auth


  /**
   * Signs in the user using Google authentication.
   * @returns {void}
   */
  googleSignIn() {
    signInWithPopup(this.auth, this.provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        this.userService.googleUser = result.user;
        this.userService.login(result.user).then(() => {
          this.router.navigate(['/home']);
        });
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  /**
   * Retrieves the Google Access Token and performs necessary actions based on the result.
   */
  getGoogleToken() {
    getRedirectResult(this.auth)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = result ? GoogleAuthProvider.credentialFromResult(result) : null;
        const token = credential?.accessToken;
        console.log('token:' + token);
        

      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  //#endregion

  //#region [User Authentication]

  //Für alle gültig

  /**
   * Signs out the user.
   */
  signOut() {
    signOut(this.auth)
      .then(() => {
        this.userService.logout();
        this.userService.googleUser = null;
      })
      .catch((error) => {
        // An error happened.
      });

  }

  /**
   * Signs in the user as a guest.
   */
  signInAsGuest() {
    this.userService.guestLogin();
  }

  //#endregion


  
}
