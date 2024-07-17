import { EventEmitter, Injectable, Output } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, getRedirectResult } from "firebase/auth";
import { DatabaseService } from './database.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor( private userService : UserService) { }


  auth = getAuth();
  provider = new GoogleAuthProvider();

  //Mail Login

  MailSignUp(email: string, password: string, username: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed up 
        this.userService.googleUser = userCredential.user
        this.userService.register(email, username, this.userService.googleUser.uid);
        // Er muss mir hier den User mit der Email vom aanderen User aus der Datenbank holen und das array "User" komplett updaten um das object fertig zu machen
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  }

  mailSignIn(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed in 
        this.userService.googleUser = userCredential.user;
        this.userService.login(userCredential.user);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }




  //Google Auth


  googleSignIn() {
    signInWithPopup(this.auth, this.provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        this.userService.googleUser = result.user;
        this.userService.login(this.userService.googleUser);
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

  getGoogleToken() {
    getRedirectResult(this.auth)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = result ? GoogleAuthProvider.credentialFromResult(result) : null;
        const token = credential?.accessToken;
        if (this.userService.googleUser) {
          this.userService.googleUser = result!.user;
          this.userService.login(this.userService.googleUser);
        }

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

  //Für alle gültig

  signOut() {
    signOut(this.auth)
      .then(() => {
        this.userService.logout();
        this.userService.googleUser = null;
        console.log('User signed out');
      })
      .catch((error) => {
        // An error happened.
      });

  }
}
