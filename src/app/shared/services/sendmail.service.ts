import { Injectable } from '@angular/core';
import { Auth, sendEmailVerification } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private auth: Auth, private router : Router) {}

  async sendMail() {
    const user = this.auth.currentUser;
    
    if (user) {
      const actionCodeSettings = {
        url: 'http://localhost:4200/?email=' + user.email,
        handleCodeInApp: true,
        dynamicLinkDomain: "http://localhost:4200",
      };
      sendEmailVerification(user, actionCodeSettings)
        .then(() => {
          this.router.navigate(['/avatar']);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
}
