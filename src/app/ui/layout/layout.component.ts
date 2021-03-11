import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {CommonService} from '../../service/common.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {AuthService} from '../../service/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CommonService, JwtHelperService]
})
export class LayoutComponent implements OnInit {
  timeLeft = 1;
  interval;
  constructor(public auth: AuthService) {
  }

  ngOnInit() {
    this.startTimer();
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
       this.auth.refreshToken();
       this.timeLeft = 1;
      }
    }, 500);
  }
}
