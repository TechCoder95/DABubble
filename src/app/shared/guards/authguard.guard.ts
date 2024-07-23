import { ActivatedRouteSnapshot, CanActivateFn, mapToCanActivate, RouterStateSnapshot } from '@angular/router';

export const isLoggedIn: CanActivateFn = (route, state) => {
  route: ActivatedRouteSnapshot;
  state: RouterStateSnapshot;
  if (localStorage.getItem('userLogin')) {
    return true
  }
  else if (sessionStorage.getItem('userLogin')) {
    return true;
  }
  else {
    window.location.href = '/user/login';
    return false;
  }
}
