import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MobileService {
  isMobile: boolean = false;
  constructor() {}
}
