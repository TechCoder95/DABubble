import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, FormsModule, CommonModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {

  email: string = '';

  constructor(private router: Router) {}

  passwordChange() {
    this.router.navigate(['/user/pw-change']);
  }

  goBack() {
    this.router.navigate(['/user/login']);
  }
}