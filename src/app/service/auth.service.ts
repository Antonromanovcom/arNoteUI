import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';

const helper = new JwtHelperService();
let myRawToken = localStorage.getItem('token');
const decodedToken = helper.decodeToken(myRawToken);
let isExpired = helper.isTokenExpired(myRawToken);


@Injectable()
export class AuthService {


  constructor(private http: HttpClient, public jwtHelper: JwtHelperService) {
  }


  public login(loginPayload): Observable<HttpResponse<Object>> {

    console.log('loginPayload ->' + loginPayload);

    const headers = {
      'Content-type': 'application/x-www-form-urlencoded'
    };

    return this.http.get<HttpResponse<Object>>('http://localhost:8080/login?' + loginPayload, {observe: 'response'});
  }

  public isAuthenticated(): boolean {

    console.log('TOKEN EXPIRE - ' + isExpired);
    return !isExpired;

  }



  public refreshToken() {

    console.log('TOKEN REFRESH');

    myRawToken = localStorage.getItem('token');
    isExpired = helper.isTokenExpired(myRawToken);

    console.log('TOKEN EXPIRE - ' + isExpired);
  }


}
