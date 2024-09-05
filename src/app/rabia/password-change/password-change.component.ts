import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { EmailService } from '../../shared/services/sendmail.service';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, FormsModule, CommonModule],
  templateUrl: './password-change.component.html',
  styleUrl: './password-change.component.scss',
})
export class PasswordChangeComponent {
  newPassword: string = '';
  newPassword2: string = '';
  minLength: number = 6;

  constructor(
    private router: Router,
    private emailService: EmailService,
    private authService: AuthenticationService,
  ) {}

  goBack() {
    this.authService.registerProcess = false;
    this.router.navigate(['/user/login']);
  }

  /**
   * Handles the password change process.
   *
   * If the new password matches the confirmation password, it calls the email service to handle the password reset.
   * After a delay of 3 seconds, it sets the registerProcess flag to false and navigates to the login page.
   */
  changepassword() {
    if (this.newPassword === this.newPassword2) {
      this.emailService.handleResetPassword(this.newPassword);
      setTimeout(() => {
        this.authService.registerProcess = false;
        this.router.navigate(['/user/login']);
      }, 3000);
    }
  }

  /**
   * Handles the form submission for password change.
   *
   * @param ngForm - The NgForm object representing the form being submitted.
   */
  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      this.changepassword();
    } else {
      console.info('Form is not valid');
      ngForm.resetForm();
    }
  }
}
