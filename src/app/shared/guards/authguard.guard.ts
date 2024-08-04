import { ActivatedRouteSnapshot, CanActivateFn, mapToCanActivate, RouterStateSnapshot } from '@angular/router';

export const isLoggedIn: CanActivateFn = (route, state) => {
  route: ActivatedRouteSnapshot;
  state: RouterStateSnapshot;
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
