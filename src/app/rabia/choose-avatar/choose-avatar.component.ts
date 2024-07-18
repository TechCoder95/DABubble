import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../shared/services/database.service';
import { UserService } from '../../shared/services/user.service';
import { doc, onSnapshot } from 'firebase/firestore';
import { User } from '../models/user.class';



@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  selectedAvatar: string = './img/avatar.svg';
  userId = '';
  user: User = new User(); // das erkennt das ganze nicht weil der gewünschte model ist leer. Sollte eig auf den vom interface greifen.. oder change add-user

  images: string[] = [
    'noah.svg',
    'steffen.svg',
    'elise.svg',
    'frederik.svg',
    'sofia.svg',
    'elias.svg'
  ];
  


  constructor(private UserService: UserService, private DatabaseService: DatabaseService, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      console.log('Test ID:', this.userId);
      this.getUser();
    });
   }
  

  getUser() {
    onSnapshot(doc(this.DatabaseService.getDataRef("users"), this.userId), ((user) => {
      this.user = new User(user.data())
      console.log('Das ist jetzt mein aktueller User: ', this.user);
    }))
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
