import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Wish} from '../dto/wish';
import {Salary} from '../dto/salary';
import {map, tap} from 'rxjs/operators';


@Injectable()
export class AuthService {


  constructor(private http: HttpClient) {
  }


  public login(loginPayload): Observable<HttpResponse<Object>> {

    console.log('loginPayload ->' + loginPayload);

    const headers = {
      'Content-type': 'application/x-www-form-urlencoded'
    }

    return this.http.get<HttpResponse<Object>>('http://localhost:8080/login?' + loginPayload, {observe: 'response'});
  }
}
