import {Component, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, Input} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {MessageCode} from '../../../service/message.code';
import {CommonService} from '../../../service/common.service';


@Component({
  selector: 'app-session-timeout-modal',
  templateUrl: './session-timeout-modal.component.html',
  styleUrls: ['./session-timeout-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionTimeoutModalComponent {

  userActivity;

  sessionTimeout: number = 864000;
  // sessionTimeout: number = 3;
  userInactive = new BehaviorSubject(false);
  consoleWatcher = '';

  constructor(
    private router: Router,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef) {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
      )
      .subscribe(() => {
        clearTimeout(this.userActivity);
        this.setTimeout();

      });

  }

  setTimeout() {

    if (this.router.url.indexOf('/401') === -1) { // отключаем проверку сессии для 401-й странички
      this.userActivity = setTimeout(() => this.userInactive.next(true), this.sessionTimeout * 1000);
    }
  }

  @HostListener('window:mousemove')
  @HostListener('window:click')
  @HostListener('window:keyup')
  refreshUserState() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }

  logout() {
    clearTimeout(this.userActivity);

    localStorage.removeItem('token');
    this.router.navigate(['401']);

    clearTimeout(this.userActivity);
    this.userInactive.next(false);
    this.cdr.markForCheck();
    const errorType = new MessageCode();
    this.sendMessagePush();
  }

  sendMessagePush() {
    const errorType = new MessageCode();
    errorType.messageType = errorType.SESSION_EXPIRED;
    this.commonService.pushError(errorType);
  }
}
