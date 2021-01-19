import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {MessageCode} from '../../../service/message.code';
import {CommonService} from '../../../service/common.service';
import {ActivatedRoute} from '@angular/router';
import {throwError, timer} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {HttpService} from '../../../service/http.service';
import {environment} from '../../../../environments/environment';
import {Bond} from '../../../dto/bond';


@Component({
  selector: 'app-invest',
  templateUrl: './investing.component.html',
  providers: [HttpService],
  styleUrls: ['./investing.component.css']
})
export class InvestingComponent implements OnInit {

  // --------------------------------- URL'ы -------------------------------------

  SERVER_URL: string = environment.serverUrl;
  BASE_URL = this.SERVER_URL + '/investing';
  GET_BONDS_URL = this.BASE_URL + '/consolidated'; // все бумаги

  // --------------------------------- ХРАНИЛИЩА -------------------------------------

  bonds: Bond[] = []; // контейнер желаний

  error: any; // отображение ошибок в алертах
  result: any; // отображение результатов в алертах
  private subscription: Subscription;
  globalError: MessageCode;
  testArray: string[] = ['1', '2', '3']; // контейнер желаний

  constructor(private commonService: CommonService, private route: ActivatedRoute, private httpService: HttpService) {
  }

  ngOnInit() {

    this.getBonds(this.GET_BONDS_URL);

    this.route.queryParams.subscribe(params => {
      const date = params.startdate;
      console.log(date);
    });

    this.subscription = this.commonService.error$.subscribe(error => {
      if (error == null) {
        this.globalError = new MessageCode();
        this.globalError.messageType = 'NO ERRORS';
      } else {
        this.globalError = error;
        if (this.globalError.messageType === this.globalError.REGISTER_OK) {
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

  // Загрузить все бумаги
  getBonds(url: string) {

    this.httpService.getData(url).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить бумаги!');
      })
    ).subscribe(data => {
      this.bonds = data['bonds'];
    });
  }

  errorHandler(err, message: string) {
    console.log('error - ' + err.error);
    this.error = message;
    console.log(err);
    timer(4000).subscribe(() => {
      this.error = null;
    });

    return throwError(err);
  }
}
