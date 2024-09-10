import { Component, OnDestroy, OnInit } from '@angular/core';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { GlobalsubService } from '../../../shared/services/globalsub.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(
    private UserService: UserService,
    private router: Router,
    public authService: AuthenticationService,
    private subService: GlobalsubService,
  ) {}

  userSub: any;

  ngOnInit() {
    this.subService.getUserObservable().subscribe(async (user) => {
      if (sessionStorage.getItem('userLogin')) {
        if (
          JSON.parse(sessionStorage.getItem('userLogin')!).avatar.includes(
            'avatar',
          )
        ) {
          this.router.navigate(['/user/chooseAvatar']);
        } else {
          this.router.navigate(['/home']);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
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
    } else {
      console.info('Form is not valid');
      ngForm.resetForm();
    }
  }

  /**
   * Performs the login operation.
   */
  login() {
    this.authService.mailSignIn(this.email, this.epassword);
  }

  /**
   * Navigates to the registration page.
   */
  goToRegister() {
    this.authService.registerProcess = true;
    this.authService.fehlerMeldung = '';
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

  /**
   * Clears the error message in the authentication service.
   */
  changeInput() {
    this.authService.fehlerMeldung = '';
  }
}
