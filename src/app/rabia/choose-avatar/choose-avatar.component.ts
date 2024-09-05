import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { DAStorageService } from '../../shared/services/dastorage.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [
    MatCardModule,
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss',
})
export class ChooseAvatarComponent {
  registerUser: boolean = false;

  images: string[] = ['1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg'];

  constructor(
    public UserService: UserService,
    private router: Router,
    private daStorage: DAStorageService,
    private authService: AuthenticationService,
  ) {
    if (this.UserService.activeUser) {
    } else {
      this.authService.registerProcess = false;
      this.router.navigate(['/user/login']);
    }
  }

  /**
   * Returns a boolean value indicating whether the user is logged in or not.
   * @returns {boolean} True if the user is logged in, false otherwise.
   */
  get isLoggedIn() {
    return this.UserService.activeUser ? true : false;
  }

  /**
   * Sets the selected avatar for the active user.
   *
   * @param {string} image - The image URL of the selected avatar.
   */
  selectAvatar(image: string) {
    this.UserService.activeUser.avatar = image;
  }

  /**
   * Navigates back to the registration page.
   */
  goBackToRegister() {
    this.authService.registerProcess = true;
    this.router.navigate(['/users/register']);
  }

  /**
   * Handles the event when a file is selected.
   *
   * @param event - The event object triggered by the file selection.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.UserService.activeUser.avatar = e.target.result as string;
          this.upload(file);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Uploads a file.
   *
   * @param file - The file to be uploaded.
   */
  upload(file: File) {
    this.daStorage.uploadFile(file, sessionStorage.getItem('uId')!);
  }

  /**
   * Saves the user's information.
   *
   * This method sets the `registerUser` property to `true` and then updates the database after a delay of 2000 milliseconds.
   */
  saveUser() {
    this.registerUser = true;
    setTimeout(() => {
      this.updateDatabase();
    }, 2000);
  }

  /**
   * Updates the database with the active user's information.
   *
   * @returns A promise that resolves when the user is successfully updated in the database.
   */
  async updateDatabase() {
    this.UserService.updateUser(this.UserService.activeUser).then(() => {
      this.authService.registerProcess = false;
      this.router.navigate(['/home']);
    });
  }
}
