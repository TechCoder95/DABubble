import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../shared/services/database.service';
import { UserService } from '../../shared/services/user.service';
import { DABubbleUser } from '../../shared/interfaces/user';
import { addDoc } from 'firebase/firestore';



@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  selectedAvatar: string = './img/avatar.svg';
  activeUser!: DABubbleUser;

  images: string[] = [
    'noah.svg',
    'steffen.svg',
    'elise.svg',
    'frederik.svg',
    'sofia.svg',
    'elias.svg'
  ];



  constructor(private UserService: UserService, private DatabaseService: DatabaseService, private router: Router) {
    this.UserService.getUsersFromDB().then(() => {
      this.activeUser = this.UserService.users.filter(user => user.uid === localStorage.getItem("uId"))[0];
      console.log("lala", this.activeUser);

    })
  }


  get isLoggedIn() {
    return localStorage.getItem("uId");
  }


  selectAvatar(image: string) {
    this.selectedAvatar = image;
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
          this.selectedAvatar = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

}
