import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { DAStorageService } from '../../shared/services/dastorage.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DABubbleUser } from '../../shared/interfaces/user';
import { AuthenticationService } from '../../shared/services/authentication.service';



@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  registerUser: boolean = false;

  images: string[] = [
    '1.svg',
    '2.svg',
    '3.svg',
    '4.svg',
    '5.svg',
    '6.svg'
  ];



  constructor(public UserService: UserService, private router: Router, private daStorage: DAStorageService, private authService: AuthenticationService) {

    if (this.UserService.activeUser) {
    }
    else {
      this.authService.registerProcess = false;
      this.router.navigate(['/user/login']);
    }
  }


  get isLoggedIn() {
    return this.UserService.activeUser ? true : false;
  }


  selectAvatar(image: string) {
    this.UserService.activeUser.avatar = image;
  }


  goBackToRegister() {
    this.authService.registerProcess = true;
    this.router.navigate(['/users/register']);
  }

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


  upload(file: File) {
    this.daStorage.uploadFile(file, sessionStorage.getItem("uId")!);
  }

  saveUser() {
    this.registerUser = true;
    setTimeout(() => {
      this.updateDatabase()
    }, 2000);
  }


  async updateDatabase() {
    this.UserService.updateUser(this.UserService.activeUser)
      .then(() => {
        this.authService.registerProcess = false;
        this.router.navigate(['/user/login'])
      });
  }

}
