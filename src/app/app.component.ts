import { Component } from '@angular/core';
import { HeaderComponent } from "./shared/components/header/header.component";
import { UserService } from './shared/services/user.service';
import { LoginComponent } from "./knezovic/home/login/login.component";
import { HomeComponent } from "./knezovic/home/home.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, LoginComponent, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dabubble';
  constructor() { }

}
