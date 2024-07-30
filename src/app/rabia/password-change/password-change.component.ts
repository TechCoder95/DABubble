import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { EmailService } from '../../shared/services/sendmail.service';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, FormsModule, CommonModule],
  templateUrl: './password-change.component.html',
  styleUrl: './password-change.component.scss'
})
export class PasswordChangeComponent {
  newPassword: string = '';
  newPassword2: string = '';

  constructor(private router: Router, private emailService: EmailService) {}

  goBack() {
    this.router.navigate(['/user/password-reset']);
  }

  changepassword() {
    if (this.newPassword === this.newPassword2) {
      this.emailService.handleResetPassword(this.newPassword);
    } else {
      console.log('Passwords do not match');
    }
  }
}
