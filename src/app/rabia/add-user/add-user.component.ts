import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  user = {
    username: '',
    mail: '',
    password: '',
  };

  acceptPolicy = false;
  readonly dialog = inject(MatDialog);

  constructor(
    private router: Router,
    public authService: AuthenticationService,
  ) {}

  /**
   * Registers a user with the provided email, password, and username.
   *
   * @param mail - The email of the user.
   * @param password - The password of the user.
   * @param username - The username of the user.
   */
  register(mail: string, password: string, username: string) {
    this.authService.MailSignUp(mail, password, username);
    this.acceptPolicy = true;
  }

  /**
   * Handles the form submission event.
   *
   * @param ngForm - The NgForm object representing the form being submitted.
   */
  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid && this.acceptPolicy) {
      this.register(this.user.mail, this.user.password, this.user.username);
    } else {
      console.info('Form is not valid');
      ngForm.resetForm();
    }
  }

  /**
   * Navigates to the login page.
   */
  goToLogin() {
    this.authService.registerProcess = false;
    this.authService.fehlerMeldung = '';
    this.router.navigate(['/user/login']);
  }
}
