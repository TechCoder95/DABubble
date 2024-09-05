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
  styleUrl: './open-profile-info.component.scss',
})
export class OpenProfileInfoComponent {
  activeUser = this.userService.activeUser;

  public dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<OpenProfileInfoComponent>);

  constructor(
    private AuthService: AuthenticationService,
    private userService: UserService,
  ) {}

  /**
   * Opens the profile card dialog.
   *
   * @remarks
   * This method opens the `OpenProfileCardComponent` dialog with a custom dialog container class.
   * It also closes the current dialog (`dialogRef`).
   */
  profileCard() {
    this.dialog.open(OpenProfileCardComponent, {
      panelClass: 'custom-dialog-container',
    });
    this.dialogRef.close();
  }

  /**
   * Logs out the user and closes the dialog.
   */
  logout() {
    this.dialogRef.close();
    this.AuthService.signOut();
  }
}
