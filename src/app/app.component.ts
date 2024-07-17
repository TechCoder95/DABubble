import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./shared/components/footer/footer.component";
import { HeaderComponent } from "./shared/components/header/header.component";
import { UserService } from './shared/services/user.service';
import { LoginComponent } from "./knezovic/home/login/login.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, HeaderComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dabubble';
  constructor(private UserService:UserService) { }

  
  get isLoggedIn() {
    return this.UserService.isLoggedIn;
  }
}
