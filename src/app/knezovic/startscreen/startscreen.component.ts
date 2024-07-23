import { Component } from '@angular/core';
import { HomeComponent } from "../home/home.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-startscreen',
  standalone: true,
  imports: [HomeComponent],
  templateUrl: './startscreen.component.html',
  styleUrl: './startscreen.component.scss'
})
export class StartscreenComponent {


  constructor(private router: Router) { }

  ngOnInit(): void {
    if (localStorage.getItem('userLogin')) {
      this.router.navigate(['/home']);
    }
    else {
      setTimeout(() => {
        this.router.navigate(['/user/login']);
      }, 4500);
    }
  }



}
