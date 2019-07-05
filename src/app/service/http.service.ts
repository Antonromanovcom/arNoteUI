import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Wish} from '../dto/wish';


@Injectable()
export class HttpService {


  constructor(private http: HttpClient) { }

  public getData(url: string): Observable<any> {
    return this.http.get(url);
  }

  public sendData(wish: Wish, url: string): Observable<Wish> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post<Wish>(url, wish, httpOptions);
  }

  public updateWish(wish: Wish, url: string): Observable<Wish> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.put<Wish>(url, wish, httpOptions);
  }


   // 'assets/data/test.json'
}
