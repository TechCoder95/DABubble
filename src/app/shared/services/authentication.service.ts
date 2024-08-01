import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, getRedirectResult, setPersistence, browserLocalPersistence, checkActionCode, applyActionCode, sendPasswordResetEmail, verifyPasswordResetCode, confirmPasswordReset, updateEmail } from "firebase/auth";
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { EmailService } from './sendmail.service';
import { updateProfile } from "firebase/auth";
import { user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private userService: UserService, private emailService: EmailService) {
    this.setLocalPersistent();
    if (this.auth.currentUser !== null) {
      this.userService.activeGoogleUserSubject.next(this.auth.currentUser);
    }
  }

  auth = getAuth();
  provider = new GoogleAuthProvider();
  fehlerMeldung: string = "";

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
        this.emailService.sendMail();
        // this.userService.login(this.userService.googleUser) // Dieser User muss in den Choose Avatar gesetzt werden!
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
        this.userService.login(userCredential.user)
        this.setLocalPersistent();
      })
      .catch((error) => {
        if (error.code === "auth/user-not-found") 
          this.fehlerMeldung = "Nutzer nicht gefunden. Bitte registrieren Sie sich.";
        else if (error.code === "auth/network-request-failed") 
          this.fehlerMeldung = "Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung."
        else if (error.code === "auth/too-many-requests") 
          this.fehlerMeldung = "Zu viele Anfragen. Versuchen Sie es später erneut.";
        else if (error.code === "auth/invalid-credential") 
          this.fehlerMeldung = "Ungültige Anmeldeinformationen";
        else if (error.code === "auth/invalid-email") 
          this.fehlerMeldung = "E-Mail-Adresse ist ungültig";
        else {
          alert(error.message);
        }
      })
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
        this.userService.login(result.user)
        this.setLocalPersistent();
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


  /**
    * Sets the local persistence for the authentication session.
    * @returns A Promise that resolves when the session persistence is set successfully, or rejects with an error if there was an issue.
    */
  setLocalPersistent() {
    setPersistence(this.auth, browserLocalPersistence)
      .then(() => { })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }
}
