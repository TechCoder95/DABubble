import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { OpenProfileInfoComponent } from '../../../rabia/open-profile-info/open-profile-info.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  activeUser = this.userService.activeUser;
  public dialog = inject(MatDialog);

  constructor(private AuthService: AuthenticationService, private userService: UserService) { }

  openMenu() {
    this.dialog.open(OpenProfileInfoComponent)
  }


  // logout() {
  //   this.AuthService.signOut();
  // }

}
