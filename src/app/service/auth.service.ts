import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';
import {environment} from '../../environments/environment';
import {Wish} from '../dto/wish';
import {NewUser} from '../dto/newuser';
import {User} from '../dto/user';

const helper = new JwtHelperService();
let myRawToken = localStorage.getItem('token');
const decodedToken = helper.decodeToken(myRawToken);
let isExpired = helper.isTokenExpired(myRawToken);


@Injectable()
export class AuthService {

  SERVER_URL: string = environment.serverUrl;
  _loginURL = 'http://localhost:8080/login?';
  loginURL = this.SERVER_URL + '/login?';


  constructor(private http: HttpClient, public jwtHelper: JwtHelperService) {
  }


  public login(loginPayload): Observable<HttpResponse<Object>> {

    console.log('loginPayload ->' + loginPayload);

    const headers = {
      'Content-type': 'application/x-www-form-urlencoded'
    };

    return this.http.get<HttpResponse<Object>>(this.loginURL + loginPayload, {observe: 'response'});
  }

  public register(newUser: User, url: string): Observable<User> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<User>(url, newUser, httpOptions);
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
