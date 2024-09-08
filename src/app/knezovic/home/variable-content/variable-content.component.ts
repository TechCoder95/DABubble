import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { Router, RouterOutlet } from '@angular/router';
import { AddUserComponent } from '../../../rabia/add-user/add-user.component';
import { ChooseAvatarComponent } from '../../../rabia/choose-avatar/choose-avatar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { EmailService } from '../../../shared/services/sendmail.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';

@Component({
  selector: 'app-variable-content',
  standalone: true,
  imports: [
    LoginComponent,
    AddUserComponent,
    ChooseAvatarComponent,
    HeaderComponent,
    RouterOutlet,
  ],
  templateUrl: './variable-content.component.html',
  styleUrl: './variable-content.component.scss',
})
export class VariableContentComponent {
  link!: string;

  constructor(
    private router: Router,
    private emailService: EmailService,
    private authService: AuthenticationService,
  ) {
    this.emailService.handleEmail();
    this.link = this.router.url;
  }

  /**
   * Navigates to the imprint page.
   */
  routeToImprint() {
    this.authService.registerProcess = false;
    this.router.navigate(['/user/imprint']);
  }

  /**
   * Navigates to the privacy page.
   */
  routeToPrivacy() {
    this.authService.registerProcess = false;
    this.router.navigate(['/user/privacy']);
  }

  getUrl() {
    return this.router.url;
  }
}
