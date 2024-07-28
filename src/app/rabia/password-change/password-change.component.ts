import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-change',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, FormsModule, CommonModule],
  templateUrl: './password-change.component.html',
  styleUrl: './password-change.component.scss'
})
export class PasswordChangeComponent {
  email: string = '';
  newPassword: string = '';

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/user/pw']);
  }
}
