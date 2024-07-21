import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DAStorageService } from '../../shared/services/dastorage.service';

@Component({
  selector: 'app-open-profile-card',
  standalone: true,
  imports: [MatButtonModule, CommonModule, FormsModule],
  templateUrl: './open-profile-card.component.html',
  styleUrl: './open-profile-card.component.scss'
})
export class OpenProfileCardComponent {

  editable: boolean = false;
  readonly dialogRef = inject(MatDialogRef<OpenProfileCardComponent>);

  constructor(private AuthService: AuthenticationService, public userService: UserService, private daStorage: DAStorageService) {
  }

  saveProfile() {
    console.log(this.userService.activeUser);

    this.updateProfile();
    this.editable = !this.editable;
  }

  editProfile() {
    this.editable = !this.editable;
  }

  changeAvatar(event: Event): void {
    console.log("das bild", this.userService.activeUser.avatar);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.userService.activeUser.avatar = e.target.result as string;
          this.upload(file);
        }
      };
      reader.readAsDataURL(file);
    }

  }

  upload(file: File) {
    this.daStorage.uploadFile(file, localStorage.getItem("uId")!);
  }

  updateProfile() {
    this.userService.updateUser(this.userService.activeUser)
  }

  closeEdit() {
    this.editable = false;
  }

  close() {
    this.dialogRef.close();
  }

}
