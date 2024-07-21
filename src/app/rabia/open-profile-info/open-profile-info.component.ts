import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { UserService } from '../../shared/services/user.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OpenProfileCardComponent } from '../open-profile-card/open-profile-card.component';

@Component({
  selector: 'app-open-profile-info',
  standalone: true,
  imports: [],
  templateUrl: './open-profile-info.component.html',
  styleUrl: './open-profile-info.component.scss'
})
export class OpenProfileInfoComponent {
  activeUser = this.userService.activeUser;

  public dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<OpenProfileInfoComponent>);

  constructor(private AuthService: AuthenticationService, private userService: UserService) {
  }

  profileCard() {
   this.dialog.open(OpenProfileCardComponent);
   this.dialogRef.close();
  }

  logout() {
    this.dialogRef.close();
    this.AuthService.signOut();
  }
}
