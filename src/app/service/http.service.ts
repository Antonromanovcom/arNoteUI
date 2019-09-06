import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Wish} from '../dto/wish';
import {Salary} from '../dto/salary';
import {User} from '../dto/user';
import {environment} from '../../environments/environment';


@Injectable()
export class HttpService {

  SERVER_URL: string = environment.serverUrl;

  _loginURL = 'http://localhost:8080/login?';
  loginURL = this.SERVER_URL + '/login?';
  _isCryptoUserUrl = 'http://localhost:8080/rest/wishes/users/getcurrent';
  isCryptoUserUrl = this.SERVER_URL + '/rest/wishes/users/getcurrent';


  constructor(private http: HttpClient) {
  }

  public getData(url: string): Observable<any> {
    return this.http.get(url);
  }

  public sendData(wish: Wish, url: string): Observable<Wish> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<Wish>(url, wish, httpOptions);
  }

  public sendFile(formData: FormData, url: string): Observable<any> {
    return this.http.post<any>(url, formData);
  }

  public sendSalary(salary: Salary, url: string): Observable<Salary> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<Salary>(url, salary, httpOptions);
  }

  public updateWish(wish: Wish, url: string): Observable<Wish> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put<Wish>(url, wish, httpOptions);
  }

  public deleteWish(id: string, url: string): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.delete(url + '/' + id, httpOptions);
  }


  public login(loginPayload): Observable<HttpResponse<Object>> {

    console.log('loginPayload ->' + loginPayload);

    const headers = {
      'Content-type': 'application/x-www-form-urlencoded'
    };

    return this.http.get<HttpResponse<Object>>(this.loginURL + loginPayload, {observe: 'response'});
  }

  public isCryptoUser(): Observable<any> {
    return this.http.get(this.isCryptoUserUrl);
  }

  public updateUserData(user: User, url: string): Observable<User> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put<User>(url, user, httpOptions);
  }

  // 'assets/data/test.json'
}
