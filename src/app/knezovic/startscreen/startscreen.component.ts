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


  constructor(private router:Router) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigateByUrl('/home');
    }, 4500);
  }



}
