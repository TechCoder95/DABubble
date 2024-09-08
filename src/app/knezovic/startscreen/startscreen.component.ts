import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../home/login/login.component';
import { TypewriterService } from '../../shared/services/typewriter.service';
import { MobileService } from '../../shared/services/mobile.service';

@Component({
  selector: 'app-startscreen',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './startscreen.component.html',
  styleUrl: './startscreen.component.scss',
})
export class StartscreenComponent {
  displayedTextWithoutCursor = '';
  cursor = '';
  private typewriterService = inject(TypewriterService);
  public mobileService = inject(MobileService);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.typewriterService.getTypewriterEffect(['DABubble']).subscribe(
      (text) => {
        if (text.endsWith('|')) {
          this.displayedTextWithoutCursor = text.slice(0, -1);
          this.cursor = '|';
        } else {
          this.displayedTextWithoutCursor = text;
          this.cursor = '';
        }
      },
      (error) => console.error(error),
    );

    if (sessionStorage.getItem('userLogin')) {
      this.router.navigate(['/home']);
    } else {
      setTimeout(() => {
        this.router.navigate(['/user/login']);
      }, 5550);
    }
  }
}
