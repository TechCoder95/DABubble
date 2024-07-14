import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  selectedAvatar: string = './img/avatar.svg';

  images: string[] = [
    'noah.svg',
    'steffen.svg',
    'elise.svg',
    'frederik.svg',
    'sofia.svg',
    'elias.svg'
  ];


  constructor(private router: Router) { }


  selectAvatar(image: string) {
    this.selectedAvatar = image;
  }


  goBackToRegister() {
    this.router.navigateByUrl('/addUser')
  }

}
