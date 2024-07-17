import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DABubbleUser } from '../../../shared/interfaces/user';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../shared/services/authentication.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(private UserService: UserService, private router: Router, private AuthService: AuthenticationService) {


  }
  @Input() userLogin!: DABubbleUser;
  @Output() userLoginChange = new EventEmitter<DABubbleUser>(); 
  email: string = '';
  epassword: string = '';

  get user(): DABubbleUser {
    return this.UserService.activeUser;
  }

  googleLogin() {
    this.AuthService.googleSignIn();
  }


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

  login() {
    this.AuthService.mailSignIn(this.email, this.epassword);
  }

  get allUsers() {
    return this.UserService.users;
  }

  goToRegister() {
    this.router.navigate(['/add-user']);
  }

}
