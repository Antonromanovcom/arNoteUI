import { Injectable } from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpHandler, HttpEvent} from '@angular/common/http';
import {Observable} from 'rxjs';
/*
@Injectable({
  providedIn: 'root'
})*/

// export class BasicAuthHtppInterceptorService  {
@Injectable()
export class BasicAuthHtppInterceptorService implements HttpInterceptor {
  constructor() { }


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const idToken = localStorage.getItem('token');
    console.log('token', idToken);

    if (idToken) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', idToken)
      });
      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }



}
