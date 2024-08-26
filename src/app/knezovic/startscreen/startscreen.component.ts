import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../home/login/login.component';
import { concat, concatMap, delay, from, ignoreElements, interval, map, of, repeat, take } from 'rxjs';
import { TypewriterService } from '../../shared/services/typewriter.service';
import { AsyncPipe } from '@angular/common';


@Component({
  selector: 'app-startscreen',
  standalone: true,
  imports: [LoginComponent, AsyncPipe],
  templateUrl: './startscreen.component.html',
  styleUrl: './startscreen.component.scss'
})
export class StartscreenComponent {



  titles = ['DABubble'];
  private typewriterService = inject(TypewriterService);

  typedText$ = this.typewriterService
    .getTypewriterEffect(this.titles)
    .pipe(map((text) => text));

  constructor(private router: Router) { }



  ngOnInit(): void {
    if (sessionStorage.getItem('userLogin')) {
      this.router.navigate(['/home']);
    }
    else {
      setTimeout(() => {
        this.router.navigate(['/user/login']);
      }, 5300);
    }
  }



}
