import { Injectable } from '@angular/core';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  setPersistence,
  browserSessionPersistence,
  signInAnonymously,
} from 'firebase/auth';
import { UserService } from './user.service';
import { EmailService } from './sendmail.service';
import { GlobalsubService } from './globalsub.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
    private subService: GlobalsubService,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.setLocalPersistent();
    if (this.auth.currentUser !== null) {
      this.subService.updateGoogleUser(this.auth.currentUser);
    }
  }

  auth = getAuth();
  provider = new GoogleAuthProvider();
  fehlerMeldung: string = '';

  loginSuccess: boolean = false;
  showMessage: boolean = false;

  registerProcess: boolean = false;

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
        this.userService.googleUser = userCredential.user;
        this.userService.register(
          email,
          username,
          this.userService.googleUser.uid,
        );
        this.emailService.sendMail();
        this.registerProcess = true;
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use')
          this.fehlerMeldung = 'Ein User mit der Email existiert bereits';
        else if (error.code === 'auth/weak-password')
          this.fehlerMeldung = 'Passwort zu schwach';
        else if (error.code === 'auth/network-request-failed')
          this.fehlerMeldung =
            'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
        else if (error.code === 'auth/too-many-requests')
          this.fehlerMeldung =
            'Zu viele Anfragen. Versuchen Sie es später erneut.';
        else if (error.code === 'auth/invalid-credential')
          this.fehlerMeldung = 'Ungültige Anmeldeinformationen';
        else if (error.code === 'auth/invalid-email')
          this.fehlerMeldung = 'E-Mail-Adresse ist ungültig';
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
        this.showMessage = true;
        this.loginSuccess = true;
        this.userService.googleUser = userCredential.user;
        this.fehlerMeldung = '';

        setTimeout(() => {
          this.userService.login(userCredential.user);
          this.setLocalPersistent();
        }, 1000);
      })
      .catch((error) => {
        this.showMessage = false;
        if (error.code === 'auth/user-not-found')
          this.fehlerMeldung =
            'Nutzer nicht gefunden. Bitte registrieren Sie sich.';
        else if (error.code === 'auth/network-request-failed')
          this.fehlerMeldung =
            'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
        else if (error.code === 'auth/too-many-requests')
          this.fehlerMeldung =
            'Zu viele Anfragen. Versuchen Sie es später erneut.';
        else if (error.code === 'auth/invalid-credential')
          this.fehlerMeldung = 'Ungültige Anmeldeinformationen';
        else if (error.code === 'auth/invalid-email')
          this.fehlerMeldung = 'E-Mail-Adresse ist ungültig';
        else {
          alert(error.message);
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
        this.fehlerMeldung = '';
        this.showMessage = true;
        this.loginSuccess = true;
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        this.userService.googleUser = result.user;

        setTimeout(() => {
          this.userService.login(result.user);
          this.setLocalPersistent();
        }, 1000);
      })
      .catch((error) => {
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
        const credential = result
          ? GoogleAuthProvider.credentialFromResult(result)
          : null;
        const token = credential?.accessToken;
      })
      .catch((error) => {
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
    signInAnonymously(this.auth)
      .then((userCredential) => {
        this.showMessage = true;
        this.loginSuccess = true;
        this.userService.googleUser = userCredential.user;

        this.userService.register(
          'Gast',
          'Gast',
          this.userService.googleUser.uid,
        );

        setTimeout(() => {
          this.userService.login(userCredential.user);
          this.setLocalPersistent();
        }, 1000);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ...
      });
  }

  //#endregion

  /**
   * Sets the local persistence for the authentication session.
   * @returns A Promise that resolves when the session persistence is set successfully, or rejects with an error if there was an issue.
   */
  setLocalPersistent() {
    setPersistence(this.auth, browserSessionPersistence)
      .then(() => {
        this.showMessage = false;
        this.loginSuccess = false;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }
}
