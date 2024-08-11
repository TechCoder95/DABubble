import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../home/login/login.component';

@Component({
  selector: 'app-startscreen',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './startscreen.component.html',
  styleUrl: './startscreen.component.scss'
})
export class StartscreenComponent {


  constructor(private router: Router) { }

  ngOnInit(): void {
    if (sessionStorage.getItem('userLogin')) {
      this.router.navigate(['/home']);
    }
    else {
      setTimeout(() => {
        this.router.navigate(['/user/login']);
      }, 5400);
    }
  }



}
