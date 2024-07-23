import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { DAStorageService } from '../../shared/services/dastorage.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



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



  constructor(public UserService: UserService, private router: Router, private daStorage: DAStorageService) {
    let id = localStorage.getItem("userLogin");
    this.UserService.getUsersFromDB().then(() => {
      this.UserService.users.map(user => user.id === id ? this.UserService.activeUser = user : null);

      if (this.UserService.activeUser) {
        if (this.UserService.activeUser.avatar == "") {
          this.router.navigate(['/avatar']);
        }
      }
      else {
        this.router.navigate(['/login']);
      }
    }
    );
  }


  get isLoggedIn() {
    return this.UserService.activeUser ? true : false;
  }


  selectAvatar(image: string) {
    this.UserService.activeUser.avatar = image;
  }


  goBackToRegister() {
    this.router.navigateByUrl('/addUser')
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
    this.daStorage.uploadFile(file, localStorage.getItem("uId")!);
  }

  saveUser() {
    this.registerUser = true;
    console.log("sollte richtig sein", this.registerUser);
    setTimeout(() => {
      this.updateDatabase()
    }, 2000);
  }


  async updateDatabase() {
    this.UserService.updateUser(this.UserService.activeUser)
      .then(() => {
        this.UserService.checkOnlineStatus();
        this.router.navigateByUrl('/home')
      });
  }

}
