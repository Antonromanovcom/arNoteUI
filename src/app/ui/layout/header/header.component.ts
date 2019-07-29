import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {catchError, tap} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {AuthService} from '../../../service/auth.service';
import {throwError, timer} from 'rxjs';
import {CommonService} from '../../../service/common.service';
import {ErrorType} from '../../../error-handling/error.type';


@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  providers: [AuthService],
  styles: []
})
export class HeaderComponent implements OnInit {

  isLogin = false;
  goals = [];
  loginDropDownMenu = ['Войти', 'О пользователе', 'Выйти'];

  loginForm = this.fb.group({
    login: ['', [
      Validators.required
    ]],
    password: ['', [
      Validators.required
    ]]
  });

  constructor(private commonService: CommonService, private authService: AuthService, private fb: FormBuilder) {
  }

  ngOnInit() {
  }

  showLoginForm(item: string) {
    console.log(item);
    this.isLogin = true;
  }

  errorHandler(err, message: string) {

    this.isLogin = false;
    let errorType = new ErrorType();
    errorType.errorType2 = errorType.WRONG_LOGIN;
    console.log('Val 1 - ' + errorType.errorType2);
    this.commonService.pushError(errorType);
    return throwError(err);
  }

  sendLogin() {

    const body = new HttpParams()
      .set('username', this.loginForm.value.login)
      .set('password', this.loginForm.value.password);

    this.authService.login(body.toString())
      .pipe(
        catchError(err => {
          // return this.errorHandler(err, 'Невозможно залогиниться!!');
          console.log('gjnvkjvnkjfln !!!!!!!!!!!!!!!!');
          return this.errorHandler(err, 'Невозможно залогиниться!!');
        }))
      .pipe(
        tap(resp => {
          console.log('header', resp.headers.get('Authorization'));
          // sessionStorage.setItem('token', resp.headers.get('Authorization'));
          localStorage.setItem('token', resp.headers.get('Authorization'));
          console.log('storage', localStorage.getItem('token'));
          this.isLogin = false;
        }))
      .subscribe();


  }
}
