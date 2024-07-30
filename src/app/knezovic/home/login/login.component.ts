import { Component } from '@angular/core';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { EmailService } from '../../../shared/services/sendmail.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(private UserService: UserService, private router: Router, public AuthService: AuthenticationService) {

    this.UserService.activeUserObserver$.subscribe((user) => {
      if (localStorage.getItem('userLogin') || sessionStorage.getItem('userLogin')) {
        this.router.navigate(['/home']);
      }
    });
  }

  email: string = '';
  epassword: string = '';

  get user(): DABubbleUser {
    return this.UserService.activeUser;
  }

  /**
   * Initiates the Google login process.
   */
  googleLogin() {
    // alert("In Bearbeitung");
    this.AuthService.googleSignIn();
  }


  /**
   * Handles the form submission event.
   * @param ngForm - The NgForm object representing the form.
   */
  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      console.info('Form is valid');
      this.login();
    }
    else {
      console.info('Form is not valid');
      ngForm.resetForm();
    }
    ngForm.resetForm();
  }


  /**
   * Performs the login operation.
   */
  login() {
    this.AuthService.mailSignIn(this.email, this.epassword)
  }


  /**
   * Gets all the users.
   * @returns An array of users.
   */
  get allUsers() {
    return this.UserService.users;
  }


  /**
   * Navigates to the registration page.
   */
  goToRegister() {
    this.router.navigate(['/user/register']);
  }

  loginAsGuest() {
    this.AuthService.signInAsGuest();
  }

  forgotPW() {
    this.router.navigate(['/user/password-reset']);
  }

  changeInput() {
    this.AuthService.fehlerMeldung = "";
  }
}
