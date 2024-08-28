import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';

export const isLoggedIn: CanActivateFn = () => {
  if (sessionStorage.getItem('userLogin')) {
    return true
  }
  else if (sessionStorage.getItem('userLoginGuest')) {
    return true;
  }
  else {
    window.location.href = '/user/login';
    return false;
  }
}
