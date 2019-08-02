import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {catchError, tap} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {AuthService} from '../../../service/auth.service';
import {throwError} from 'rxjs';
import {CommonService} from '../../../service/common.service';
import {MessageCode} from '../../../service/message.code';
import {Router} from '@angular/router';
import {HttpService} from '../../../service/http.service';
import {User} from '../../../dto/user';
import {Wish} from '../../../dto/wish';


@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  providers: [AuthService, HttpService],
  styles: []
})
export class HeaderComponent implements OnInit {


  // --------------------------------- URL'ы -------------------------------------


  cryptokey = '';
  _myBaseUrl = '/rest/wishes';
  myBaseUrl = 'http://localhost:8080/rest/wishes';
  usersUrl = this.myBaseUrl + '/users'; // основная ссылка на api

  isLogin = false; // вывод диалогового окна логгирования
  loginDropDownMenu: string[];
  isUserDataEdit = false; // вывод диалогового информации о пользователе.
  // isUserCrypto: boolean;
  user: User;

  loginForm = this.fb.group({
    login: ['', [
      Validators.required
    ]],
    password: ['', [
      Validators.required
    ]]
  });

  userInfoForm = this.fb.group({
    editlogin: ['', [
      Validators.required,
      Validators.pattern(/^[A-Za-z0-9]+$/)
    ]],
    editpassword: ['', []]
    ,
    isencrypted: [false, []],
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    fullname: ['', []],
    cryptkey: ['', [Validators.required]]
  });

  constructor(private commonService: CommonService, private authService: AuthService, private httpService: HttpService, private fb: FormBuilder, public router: Router) {
  }

  ngOnInit() {

    const idToken = localStorage.getItem('token');
    this.cryptokey = localStorage.getItem('cryptokey');
    console.log('cryptokey is - ' + this.cryptokey);
    this.user = new User();


    if (idToken) {
      this.loginDropDownMenu = ['О пользователе', 'Выйти'];
    } else {
      this.loginDropDownMenu = ['Зарегистрироваться', 'Войти', 'Выйти'];
    }
  }

  loadUserData() {

    this.httpService.isCryptoUser().pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить крипто-статус пользователя!');
      })
    ).subscribe(data => {

      this.user.id = data.id;
      this.user.login = data.login;
      this.user.pwd = data.pwd;
      this.user.userRole = data.userRole;
      this.user.userCryptoMode = data.userCryptoMode;
      this.user.creationDate = data.creationDate;
      this.user.email = data.email;
      this.user.fullname = data.fullname;

      // console.log('user-login sub - >', this.user.login);

      this.userInfoForm.patchValue({
        editlogin: this.user.login,
        editpassword: this.user.pwd,
        isencrypted: this.user.userCryptoMode,
        email: this.user.email,
        fullname: this.user.fullname
      });

    });
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

    } else if (item === 'О пользователе') {
      this.loadUserData();
      this.isUserDataEdit = true;
    }
  }

  errorHandler(err, message: string) {

    this.isLogin = false;
    this.isUserDataEdit = false;

    const errorType = new MessageCode();
    if (message === 'LOGINERROR') {
      this.sendMessagePush(errorType.WRONG_LOGIN);
    } else {
      console.log('e ... ', err.error);

      if (err.error === 'SUCH_USER_EXIST') {
        this.sendMessagePush(errorType.USER_DATA_CHANGE_SUCH_USER_EXISTS);
      } else {
        this.sendMessagePush(errorType.USER_DATA_CHANGE_SOME_ERROR);
      }
    }
    return throwError(err);
  }


  changeUserData() {


    this.user.login = this.userInfoForm.value.editlogin;
    // this.user.pwd = this.userInfoForm.value.editpassword;
    this.user.userCryptoMode = this.userInfoForm.value.isencrypted;
    this.user.email = this.userInfoForm.value.email;
    this.user.fullname = this.userInfoForm.value.fullname;


    this.httpService.updateUserData(this.user, this.usersUrl + '/' + this.user.id).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно выполнить редактирование пользовательских данных!');
      })
    ).subscribe(hero => {

      const messageType = new MessageCode();
      this.sendMessagePush(messageType.USER_DATA_CHANGE_OK);
      this.isUserDataEdit = false;
      localStorage.setItem('cryptokey', this.userInfoForm.value.cryptkey);
      console.log('cryptokey is written - ' + this.userInfoForm.value.cryptkey);
    });
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
          return this.errorHandler(err, 'LOGINERROR');
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
