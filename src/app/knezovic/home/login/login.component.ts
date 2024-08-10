import { Component, OnDestroy, OnInit } from '@angular/core';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../shared/services/authentication.service'; // Add this line

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(private UserService: UserService, private router: Router, public authService: AuthenticationService) {
    
  }

  userSub: any;


  ngOnInit() {
    this.userSub = this.UserService.activeUserObserver$.subscribe((user) => {
      // console.log('login zeile 27');
      if (sessionStorage.getItem('userLogin') || sessionStorage.getItem('userLoginGuest')) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
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
      this.authService.googleSignIn();
  }


  /**
   * Handles the form submission event.
   * @param ngForm - The NgForm object representing the form.
   */
  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
        this.login();
    }
    else {
      console.info('Form is not valid');
      ngForm.resetForm();
    }
  }


  /**
   * Performs the login operation.
   */
  login() {
    this.authService.mailSignIn(this.email, this.epassword)
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
    this.authService.registerProcess = true;
    this.router.navigate(['/user/register']);
  }


  /**
   * Logs in the user as a guest.
   */
  loginAsGuest() {
      this.authService.signInAsGuest();
  }


  /**
   * Initiates the password reset process.
   * Sets the registerProcess flag of the authService to true.
   * Navigates to the '/user/password-reset' route.
   */
  forgotPW() {
    this.authService.registerProcess = true;
    this.router.navigate(['/user/password-reset']);
  }


  changeInput() {
    this.authService.fehlerMeldung = "";
  }
}
