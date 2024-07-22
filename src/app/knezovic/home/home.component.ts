import { Component, Input, OnInit } from '@angular/core';
import { LoginComponent } from "./login/login.component";
import { UserService } from '../../shared/services/user.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { SidenavComponent } from "../../tristan/sidenav/sidenav.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { VariableContentComponent } from "./variable-content/variable-content.component";
import { Router } from '@angular/router';
import { EmailService } from '../../shared/services/sendmail.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoginComponent, SidenavComponent, HeaderComponent, FooterComponent, VariableContentComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {


  constructor(private UserService: UserService, private router: Router, private emailService: EmailService) {
    this.UserService.activeUserObserver$.subscribe((user) => {
      if (!localStorage.getItem('userLogin') || (localStorage.getItem('userLogin') && user.avatar == "") || (!localStorage.getItem('userLogin') && !sessionStorage.getItem('userLogin'))) {
        if (user.avatar === '') {
          this.router.navigate(['/avatar']);
        }
        else {
          this.router.navigate(['/login']);
        }
      }
    });

  }


  get isLoggedIn() {
    return this.UserService.isLoggedIn;
  }
}
