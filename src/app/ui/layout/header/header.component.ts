import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {catchError, tap} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {AuthService} from '../../../service/auth.service';
import {throwError, timer} from 'rxjs';
import {CommonService} from '../../../service/common.service';
import {MessageCode} from '../../../service/message.code';
import {Router} from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  providers: [AuthService],
  styles: []
})
export class HeaderComponent implements OnInit {

  isLogin = false;
  loginDropDownMenu: string[];

  loginForm = this.fb.group({
    login: ['', [
      Validators.required
    ]],
    password: ['', [
      Validators.required
    ]]
  });

  constructor(private commonService: CommonService, private authService: AuthService, private fb: FormBuilder, public router: Router) {
  }

  ngOnInit() {

    const idToken = localStorage.getItem('token');


    if (idToken) {
      this.loginDropDownMenu = ['О пользователе', 'Выйти'];
    } else {
      this.loginDropDownMenu = ['Зарегистрироваться', 'Войти', 'Выйти'];
    }
  }

  loginIconHandler(item: string) {
    if (item === 'Войти') {
      console.log(item);
      this.isLogin = true;
    } else if (item === 'Выйти') {
      console.log('unauthorize');
      this.loginDropDownMenu = ['Зарегистрироваться', 'Войти', 'Выйти'];
      localStorage.removeItem('token');
      this.router.navigate(['401']);

      // TODO: ПЕРЕБРОС НА СТРАНИЦУ НЕ ЗАЛОГИНЕННЫХ ЮЗЕРОВ

    } else if (item === 'О пользователе') {

      const message = new MessageCode();
      this.sendMessagePush(message.UNDER_CONSTRACTION);

    }
  }

  errorHandler(err, message: string) {

    this.isLogin = false;
    const errorType = new MessageCode();
    this.sendMessagePush(errorType.WRONG_LOGIN);

    return throwError(err);
  }

  sendMessagePush(message: string) {
    const errorType = new MessageCode();
    errorType.messageType = errorType.WRONG_LOGIN;
    errorType.messageType = message;
    console.log('Error message- ' + errorType.messageType);
    this.commonService.pushError(errorType);

  }

  sendLogin() {

    const body = new HttpParams()
      .set('username', this.loginForm.value.login)
      .set('password', this.loginForm.value.password);

    this.authService.login(body.toString())
      .pipe(
        catchError(err => {
          return this.errorHandler(err, 'Невозможно залогиниться!!');
        }))
      .pipe(
        tap(resp => {
          console.log('header', resp.headers.get('Authorization'));
          localStorage.removeItem('token');
          localStorage.setItem('token', resp.headers.get('Authorization'));
          console.log('storage', localStorage.getItem('token'));
          this.isLogin = false;

          this.authService.refreshToken();

          this.router.navigate(['']);
          this.loginDropDownMenu = ['О пользователе', 'Выйти'];
          const message = new MessageCode();
          this.sendMessagePush(message.AUTH_LOGIN_OK);
        }))
      .subscribe();


  }
}
