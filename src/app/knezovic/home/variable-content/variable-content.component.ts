import { Component } from '@angular/core';
import { LoginComponent } from "../login/login.component";
import { Router } from '@angular/router';
import { AddUserComponent } from "../../../rabia/add-user/add-user.component";
import { ChooseAvatarComponent } from "../../../rabia/choose-avatar/choose-avatar.component";
import { HeaderComponent } from "../../../shared/components/header/header.component";

@Component({
  selector: 'app-variable-content',
  standalone: true,
  imports: [LoginComponent, AddUserComponent, ChooseAvatarComponent, HeaderComponent],
  templateUrl: './variable-content.component.html',
  styleUrl: './variable-content.component.scss'
})
export class VariableContentComponent {

  link!: string;

  constructor(private router : Router) {
    console.log(this.router.url);
    this.link = this.router.url;
   }


}
