import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MobileService {
  
  isMobile: boolean = false;
  isChat: boolean = false;

  constructor() {
    if (window.innerWidth <= 910) {
      this.isMobile = true;
    }
  }
}
