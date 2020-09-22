import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Wish} from '../dto/wish';
import {Salary} from '../dto/salary';
import {User} from '../dto/user';
import {environment} from '../../environments/environment';
import {ChangeWishMonthOrderDto} from '../dto/ChangeWishMonthOrderDto';


@Injectable()
export class HttpService { // todo: навести порядок во всем классе

  SERVER_URL: string = environment.serverUrl;
  loginURL = this.SERVER_URL + '/login?';
  isCryptoUserUrl = this.SERVER_URL + '/user/current';

  constructor(private http: HttpClient) {}

  public getData(url: string): Observable<any> { // todo: тут надо разобраться с именованием и может быть повыкидывать половину
    return this.http.get(url);
  }

  public toggleUserViewMode(url: string): Observable<any> {
    return this.http.post<any>(url, null);
  }

  public changeMonthOrder(wish: ChangeWishMonthOrderDto, url: string): Observable<Wish> {
    const httpOptions = { // todo: вынести в отдельный метод
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Wish>(url, wish, httpOptions);
  }

  public sendData(wish: Wish, url: string): Observable<Wish> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Wish>(url, wish, httpOptions);
  }

  public findWish(wish: Wish, url: string): Observable<any> {
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
}
