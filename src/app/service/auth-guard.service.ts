import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from './auth.service';


@Injectable()
export class AuthGuardService  implements CanActivate {


  constructor(public auth: AuthService, public router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isAuthenticated()) {
      console.log('is auth - ' + !this.auth.isAuthenticated());
      this.router.navigate(['401']);
      return false;
    }
    return true;
  }
}
