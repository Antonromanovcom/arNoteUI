import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {CommonService} from '../../service/common.service';
import {JwtHelperService} from '@auth0/angular-jwt';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CommonService, JwtHelperService]
})
export class LayoutComponent implements OnInit {

  idToken: string;
  timeLeft = 2;
  interval;
  jwtHelper = new JwtHelperService();
  isExpired: boolean;

  constructor() {
  }

  ngOnInit() {
    this.idToken = localStorage.getItem('token');
    this.isExpired = this.jwtHelper.isTokenExpired(this.idToken);
    this.startTimer();
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.idToken = localStorage.getItem('token');
        this.timeLeft = 2;
      }
    }, 1000);
  }
}
