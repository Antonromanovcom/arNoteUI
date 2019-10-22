import { Component, OnInit } from '@angular/core';
import {CommonService} from '../../../service/common.service';
import {Subscription} from 'rxjs/Subscription';
import {MessageCode} from '../../../service/message.code';
import {timer} from 'rxjs';

@Component({
  selector: 'app-unauthorize',
  templateUrl: './unauthorize.component.html',
  styleUrls: ['./unauthorize.component.css']
})
export class UnauthorizeComponent implements OnInit {

  error: any; // отображение ошибок в алертах
  result: any; // отображение результатов в алертах

  private subscription: Subscription;
  globalError: MessageCode;

  constructor(private commonService: CommonService) { }

  ngOnInit() {

    this.subscription = this.commonService.error$.subscribe(error => {
      if (error == null) {

        this.globalError = new MessageCode();
        this.globalError.messageType = 'NO ERRORS';

      } else {

        this.globalError = error;
        if (this.globalError.messageType === this.globalError.AUTH_LOGIN_OK) {
        } else if (this.globalError.messageType === this.globalError.REGISTER_OK) {
          this.result = this.globalError.REGISTER_OK;
          timer(4000).subscribe(() => {
            this.result = null;
          });
        } else {
          if (this.globalError.messageType !== this.globalError.SESSION_EXPIRED) {
            this.error = error.messageType;
            timer(4000).subscribe(() => {
              this.error = null;
            });
          }
        }
      }
    });
  }

}
