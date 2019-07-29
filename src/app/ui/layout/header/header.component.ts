import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {catchError, tap} from 'rxjs/operators';
import {HttpParams} from '@angular/common/http';
import {AuthService} from '../../../service/auth.service';
import {throwError, timer} from 'rxjs';
import {CommonService} from '../../../service/common.service';

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

  constructor(private commonService: CommonService, private authService: AuthService, private fb: FormBuilder) { }

  testit() {
    this.goals.push('bbbb');
    console.log('goals - ' + this.goals);
    this.commonService.changeGoal(this.goals);
  }

  ngOnInit() {

    // this.commonService.goal.subscribe(res => this.goals = res);

    this.goals.push('aaaaaaaaaa');
    console.log('goals - ' + this.goals);
    this.commonService.changeGoal(this.goals);

    // this.commonService.changeGoal(this.goals);

  }
  showLoginForm(item: string) {
    console.log(item);
    this.isLogin = true;
  }

  errorHandler(err, message: string) {
    // this.isEdit = false;
    // this.isSalaryAdd = false;
    // this.error = message;

    console.log('errorHandler - ' + err);
    // this.commonService.notifyOther({option: 'onSubmit', value: 'From header'});

    return throwError(err);
  }

  sendLogin() {

    const body = new HttpParams()
      .set('username', this.loginForm.value.login)
      .set('password', this.loginForm.value.password);

    this.goals.push('aaaaaaaaaa');
    console.log('goals - ' + this.goals);
    this.commonService.changeGoal(this.goals);

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
