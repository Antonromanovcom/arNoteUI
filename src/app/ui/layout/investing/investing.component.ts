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
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FoundInstrument} from '../../../dto/FoundInstrument';
import {CurrentPrice} from '../../../dto/CurrentPrice';
import {NewInstrumentRq} from '../../../dto/NewInstrumentRq';
import * as moment from 'moment';
import {Moment} from 'moment';


@Component({
  selector: 'app-invest',
  templateUrl: './investing.component.html',
  providers: [HttpService],
  styleUrls: ['./investing.component.css']
})
export class InvestingComponent implements OnInit {

  // --------------------------------- URL'ы ----------------------------------------

  SERVER_URL: string = environment.serverUrl;
  BASE_URL = this.SERVER_URL + '/investing';
  GET_BONDS_URL = this.BASE_URL + '/consolidated'; // все бумаги
  FIND_INSTRUMENTS_URL = this.BASE_URL + '/search'; // найти инструменты
  GET_CURRENT_PRICE_BY_TICKER_URL = this.BASE_URL + '/price'; // текущая цена по тикеру
  GET_PRICE_BY_TICKER_AND_DATE_URL = this.BASE_URL + '/price-by-date'; // текущая цена по тикеру

  // --------------------------------- ХРАНИЛИЩА ------------------------------------

  bonds: Bond[] = []; // контейнер бумаг
  instruments: FoundInstrument[] = [];
  currentPrice: CurrentPrice;
  selectedInstrument: any; // выбранный инструмент. Используется при поиске инструментов.
  selectedPaper: Bond; // выбранный инструмент. Используется в основном датагриде.
  error: any; // отображение ошибок в алертах
  result: any; // отображение результатов в алертах
  private subscription: Subscription;
  globalError: MessageCode;

  // --------------------------------- ПЕРЕКЛЮЧАТЕЛИ МОДАЛОВ -------------------------

  isAddDialogShown: boolean; // открытие диалога добавления инструмента.
  isFoundInstrumentsBlockShown: boolean; // ???

  // ---------------------------------- ФОРМЫ ----------------------------------------
  addInstrumentForm = this.fb.group({
    ticker: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    price: ['', [
      Validators.required,
      Validators.maxLength(20)
    ]],
    lot: ['', [
      Validators.required,
      Validators.maxLength(5)
    ]],
    purchaseDate: ['', []],
    isPlan: [false, []]
  });



  constructor(private commonService: CommonService, private route: ActivatedRoute,
              private httpService: HttpService, private fb: FormBuilder) {
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

  /**
   * Открыть диалоговое окно добавления бумаги.
   *
   * event
   */
  openAddInstrument(event: any) {
    this.isAddDialogShown = true;

    this.addInstrumentForm.patchValue({
      ticker: '',
      price: ''
    });
  }

  selectionChanged(event: any) {
    console.log(this.selectedInstrument.ticker);
    this.getCurrentPriceAndLot(this.selectedInstrument.ticker);
  }

  /**
   * Запросить цену по конкретной дате.
   *
   * event - выбранная дата
   */
  getPriceForCurrentDate(event: any) {
    let currentDate: Moment;
    if (event == null) {
      currentDate = moment(new Date(), 'DD/MM/YYYY');
    } else {
      currentDate = moment(Date.parse(event));
      if (currentDate == null) {
        currentDate = moment(new Date(), 'DD/MM/YYYY');
      }
      console.log('Converted date after format: ', currentDate.format('YYYY-MM-DD'));

      this.httpService.getData(this.GET_PRICE_BY_TICKER_AND_DATE_URL
        + '?ticker='
        + this.selectedInstrument.ticker
        + '&purchaseDate='
        + currentDate.format('YYYY-MM-DD')).pipe(
        catchError(err => {
          return this.errorHandler(err, 'Невозможно запросить текущую цену бумаги!');
        })
      ).subscribe(data => {
        this.currentPrice = data;
        console.log('Получили текущую цену на конкретную дату: ', this.currentPrice.currentPrice);
        this.addInstrumentForm.patchValue({
          price: this.currentPrice.currentPrice
        });
      });
    }
  }

  /**
   * Изменение поля тикер при добавлении нового инструмента.
   * @param searchValue - значение введенное в поле.
   */
  onTickerFieldChangeForNewInstrumentDlg(searchValue: string) {

    if (searchValue.length > 0) {
      this.isFoundInstrumentsBlockShown = true;
      this.findInstruments(searchValue);
      this.selectedInstrument = null;
    } else {
      this.selectedInstrument = null;
      this.isFoundInstrumentsBlockShown = false;
    }
  }

  /**
   * Отобразить алерт!
   *
   *  text
   *  mode
   *  result
   */
  showAlert(text: string, mode: string, result: any) {

    this.result = text;
    this.selectedInstrument = null;
    this.isAddDialogShown = false;
    this.isFoundInstrumentsBlockShown = false;
    this.addInstrumentForm.value.isPlan = false;

    timer(4000).subscribe(() => {
      this.result = null;
    });
  }


  /**
   * Добавить инструмент. Вызывается из модала.
   *
   * payload
   */
  addInstrument() {

    let payload: NewInstrumentRq;
    const DATE_TIME_FORMAT = 'DD/MM/YYYY';
    let currentDate: Moment;
    if (!this.addInstrumentForm.value.purchaseDate) {
      currentDate = moment(new Date(), DATE_TIME_FORMAT);
    } else {
      currentDate = moment(this.addInstrumentForm.value.purchaseDate, DATE_TIME_FORMAT);
    }
    console.log('Selected date after format: ', currentDate.format('YYYY-MM-DD'));

    if (this.addInstrumentForm.value.isPlan) {
       payload = new NewInstrumentRq(this.addInstrumentForm.value.ticker,
        this.addInstrumentForm.value.isPlan,
         this.selectedInstrument.type,
        null,
        null,
        null,
      );
    } else {
      payload = new NewInstrumentRq(this.addInstrumentForm.value.ticker,
        this.addInstrumentForm.value.isPlan,
        this.selectedInstrument.type,
        this.addInstrumentForm.value.price,
        this.addInstrumentForm.value.lot,
        currentDate.format('YYYY-MM-DD'),
      );
    }

    this.httpService.addInstrument(payload, this.BASE_URL).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно добавить бумагу!');
      })
    ).subscribe(hero => {
      this.showAlert('Инструмент успешно добавлен!', 'ADD MODE', hero);
      this.getBonds(this.GET_BONDS_URL);
    });
  }

  /**
   * Запросить текущую цену бумаги и лот.
   *
   * @param keyword - искомое слово.
   */
  getCurrentPriceAndLot(keyword: string) {

    this.httpService.getData(this.GET_CURRENT_PRICE_BY_TICKER_URL + '?ticker=' + keyword).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно запросить текущую цену бумаги!');
      })
    ).subscribe(data => {
      this.currentPrice = data;
      console.log('Получили текущую цену: ', this.currentPrice.currentPrice);
      this.addInstrumentForm.patchValue({
        ticker: this.currentPrice.ticker,
        price: this.currentPrice.currentPrice,
        lot: this.currentPrice.minLot
      });
    });
  }

  /**
   * Поиск бумаги.
   *
   * @param keyword - искомое слово.
   */
  findInstruments(keyword: string) {

    this.httpService.getData(this.FIND_INSTRUMENTS_URL + '?keyword=' + keyword).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно найти бумаги!');
      })
    ).subscribe(data => {
      this.instruments = data.instruments;
      console.log(this.instruments.length);
    });
  }

  // Загрузить все бумаги
  getBonds(url: string) {

    this.httpService.getData(url).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить бумаги!');
      })
    ).subscribe(data => {
      this.bonds = data.bonds;
    });
  }

  /**
   * Удалить бумагу.
   *
   *
   */
  deleteBond() {

    this.httpService.deleteInstrument(this.selectedPaper.ticker, this.BASE_URL).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно удалить бумагу!');
      })
    ).subscribe(data => {
      this.getBonds(this.GET_BONDS_URL);
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
