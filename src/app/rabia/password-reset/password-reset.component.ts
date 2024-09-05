import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { EmailService } from '../../shared/services/sendmail.service';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, FormsModule, CommonModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss',
})
export class PasswordResetComponent {
  email: string = '';
  message: boolean = false;

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
   * Handles the form submission for password reset.
   *
   * @param ngForm - The NgForm object representing the form being submitted.
   */
  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      this.emailService.changePassword(this.email);
      this.message = true;
      ngForm.resetForm();
      setTimeout(() => {
        this.authService.registerProcess = false;
        this.router.navigate(['/user/login']);
      }, 2000);
    } else {
      console.info('Form is not valid');
      ngForm.resetForm();
    }
  }
}
