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
import {FormBuilder, Validators} from '@angular/forms';
import {FoundInstrument} from '../../../dto/FoundInstrument';
import {CurrentPrice} from '../../../dto/CurrentPrice';
import {NewInstrumentRq} from '../../../dto/NewInstrumentRq';
import * as moment from 'moment';
import {Moment} from 'moment';
import {Returns} from '../../../dto/returns';
import {Calendar} from '../../../dto/calendar';
import {ModalService} from '../../../service/modal.service';

@Component({
  selector: 'app-invest',
  templateUrl: './investing.component.html',
  providers: [HttpService],
  styleUrls: ['./../main/main.component.css']
})
export class InvestingComponent implements OnInit {

  // --------------------------------- URL'ы ----------------------------------------

  SERVER_URL: string = environment.serverUrl;
  BASE_URL = this.SERVER_URL + '/investing';
  GET_BONDS_URL = this.BASE_URL + '/consolidated'; // все бумаги
  GET_BONDS_URL_WITH_FILTERING = this.BASE_URL + '/consolidated?filter='; // все бумаги
  GET_BONDS_URL_WITH_SORT = this.BASE_URL + '/consolidated?sort='; // все бумаги
  FIND_INSTRUMENTS_URL = this.BASE_URL + '/search'; // найти инструменты
  GET_CURRENT_PRICE_BY_TICKER_URL = this.BASE_URL + '/price'; // текущая цена по тикеру
  GET_PRICE_BY_TICKER_AND_DATE_URL = this.BASE_URL + '/price-by-date'; // текущая цена по тикеру
  GET_RETURNS = this.BASE_URL + '/returns'; // доходы
  CALENDAR = this.BASE_URL + '/calendar'; // календарь

  // --------------------------------- ХРАНИЛИЩА ------------------------------------

  bonds: Bond[] = []; // контейнер бумаг
  returns: Returns; // доходы
  calc: Calendar[] = []; // календарь

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
  isDivAndCouponModalShown: boolean; // открытие диалога с инфой по купонам / модалам
  isReturnsInfoShown: boolean; // открытие диалога с инфой по доходам
  isCalendarShown: boolean; // открытие диалога с инфой по доходам
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

  // ---------------------------------- ФИЛЬТРЫ ----------------------------------------

  filtersForInstrumentType = ['Акция', 'Облигация'];
  filtersForStatus = ['План', 'Факт']; // фильтры
  sortModes = ['По возрастанию [A-z / 1-10]', 'По убыванию [Z-a / 10-1]'];

  constructor(private commonService: CommonService, private route: ActivatedRoute, private httpService: HttpService,
              private modalService: ModalService, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.getBonds(this.GET_BONDS_URL);
    this.route.queryParams.subscribe(params => {
      const date = params.startdate;
    });
    this.subscription = this.commonService.error$.subscribe(error => {
      if (error == null) {
        this.globalError = new MessageCode();
        this.globalError.messageType = 'NO ERRORS';
      } else {
        this.globalError = error;
        if (this.globalError.messageType === this.globalError.AUTH_LOGIN_OK) {
          console.log('LOGIN OK');
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

  /**
   * Метод, отрабатывающий при выборе одного из найденных тикеров при добавлении иснтрумента.
   *
   * event
   */
  selectionChanged() {
    this.getCurrentPriceAndLot(this.selectedInstrument.ticker, this.selectedInstrument.stockExchange);
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
    this.isAddDialogShown = null;
    this.isDivAndCouponModalShown = false;
    this.isReturnsInfoShown = false;
    this.isCalendarShown = false;
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
  addInstrument(id: string) {

    let payload: NewInstrumentRq;
    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    let currentDate: Moment;
    if (!this.addInstrumentForm.value.purchaseDate) {
      currentDate = moment(new Date(), DATE_TIME_FORMAT);
    } else {
      currentDate = moment(this.addInstrumentForm.value.purchaseDate, DATE_TIME_FORMAT);
    }
    console.log('Selected date after format: ', currentDate.format('YYYY-MM-DD'));
    console.log('currentDate: ', currentDate.toLocaleString());
    console.log('currentDate: ', this.addInstrumentForm.value.purchaseDate);

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
    this.modalService.close(id);
    console.log('Message = ', payload);
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
   * ticker - тикер инструмента.
   * se - биржа.
   */
  getCurrentPriceAndLot(ticker: string, se: string) {

    this.httpService.getData(this.GET_CURRENT_PRICE_BY_TICKER_URL + '?ticker=' + ticker + '&stockExchange='+se).pipe(
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
    console.log('url = ', url);
    this.httpService.getData(url).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить бумаги!');
      })
    ).subscribe(data => {
      this.bonds = data.bonds;
      this.getReturns(this.GET_RETURNS);
    });
  }

  /**
   * Открыть модал с календарем и подгрузить данные.
   *
   */
  openCalendarAndLoadData() {
    this.isCalendarShown = true;
    this.getCalendar(this.CALENDAR);
  }


  /**
   * Календарь.
   *
   * url
   */
  getCalendar(url: string) {
    this.httpService.getData(url).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить календарь!');
      })
    ).subscribe(data => {
      this.calc = data.calendar;
    });
  }

  /**
   * Выгрузить доходы по бумагам.
   *
   * url
   */
  getReturns(url: string) {
    this.httpService.getData(url).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить доходы!');
      })
    ).subscribe(data => {
      this.returns = data;
    });
  }


  /**
   * Реакция на изменение типа фильтрации.
   *
   * item
   */
  changeTypeFilter(item: string) {

    switch (item) {
      case 'Акция': {
        this.getBonds(this.GET_BONDS_URL_WITH_FILTERING + 'TYPE_SHARE');
        break;
      }
      case 'Облигация': {
        this.getBonds(this.GET_BONDS_URL_WITH_FILTERING + 'TYPE_BOND');
        break;
      }
      case 'План': {
        this.getBonds(this.GET_BONDS_URL_WITH_FILTERING + 'STATUS_PLAN');
        break;
      }
      case 'Факт': {
        this.getBonds(this.GET_BONDS_URL_WITH_FILTERING + 'STATUS_FACT');
        break;
      }
      default: {
        this.getBonds(this.GET_BONDS_URL_WITH_FILTERING + 'NONE');
        break;
      }
    }
  }

  /**
   * Очистить все фильтры.
   *
   * item
   */
  clearFilters() {
    this.getBonds(this.GET_BONDS_URL_WITH_FILTERING + 'NONE');
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
    this.error = message;
    timer(4000).subscribe(() => {
      this.error = null;
    });

    return throwError(err);
  }

  /**
   * Переключение режимов сортировки.
   *
   * item
   * type
   */
  changeSort(item: string, type: string) {
    switch (type) {
      case 'TICKER': {
        const s = item === 'По возрастанию [A-z / 1-10]' ? 'TICKER_ASC' : 'TICKER_DESC';
        this.getBonds(this.GET_BONDS_URL_WITH_SORT + s);
        break;
      }
      case 'DIV-RUB': {
        const s = item === 'По возрастанию [A-z / 1-10]' ? 'DIV_RUB_ASC' : 'DIV_RUB_DESC';
        this.getBonds(this.GET_BONDS_URL_WITH_SORT + s);
        break;
      }
      case 'DIV-PRCNT': {
        const s = item === 'По возрастанию [A-z / 1-10]' ? 'DIV_PRCNT_ASC' : 'DIV_PRCNT_DESC';
        this.getBonds(this.GET_BONDS_URL_WITH_SORT + s);
        break;
      }
      case 'CUR-PRICE': {
        const s = item === 'По возрастанию [A-z / 1-10]' ? 'CUR_PRICE_ASC' : 'CUR_PRICE_DESC';
        this.getBonds(this.GET_BONDS_URL_WITH_SORT + s);
        break;
      }
      case 'FINAL-PRICE': {
        const s = item === 'По возрастанию [A-z / 1-10]' ? 'FINAL_PRICE_ASC' : 'FINAL_PRICE_DESC';
        this.getBonds(this.GET_BONDS_URL_WITH_SORT + s);
        break;
      }
      case 'TOTAL-GROW': {
        const s = item === 'По возрастанию [A-z / 1-10]' ? 'TOTAL_GROW_ASC' : 'TOTAL_GROW_DESC';
        this.getBonds(this.GET_BONDS_URL_WITH_SORT + s);
        break;
      }
      case 'TODAY-GROW': {
        const s = item === 'По возрастанию [A-z / 1-10]' ? 'TODAY_GROW_ASC' : 'TODAY_GROW_DESC';
        this.getBonds(this.GET_BONDS_URL_WITH_SORT + s);
        break;
      }
      default: {
        this.getBonds(this.GET_BONDS_URL_WITH_SORT + 'NONE');
        break;
      }
    }
  }

  /**
   * Очистка сортировки.
   *
   */
  clearSorting() {
    this.getBonds(this.GET_BONDS_URL_WITH_SORT + 'NONE');
  }

  /**
   * Метод для фронта: проверяем доступность кнопки для вывода дивидендов / купонов
   */
  isDivsExist() {
    return this.selectedPaper
      && this.selectedPaper.dividends
      && this.selectedPaper.dividends.dividendList != null
      && this.selectedPaper.dividends.dividendList.length > 0;
  }

  /**
   * Метод для фронта: меняем название кнопки в зависимости от различных данных выбранной бумаги.
   */
  getDivButtonName() {
    if (this.selectedPaper) {
      if (this.selectedPaper
        && this.selectedPaper.dividends
        && this.selectedPaper.dividends.dividendList != null
        && this.selectedPaper.dividends.dividendList.length > 0) {
        return this.selectedPaper.type === 'SHARE' ? 'Дивиденды' : 'Купоны';
      } else {
        return this.selectedPaper.type === 'SHARE' ? 'Нет дивидендов' : 'Нет купонов';
      }
    } else {
      return 'Купоны / Дивы: выберете бумагу!';
    }
  }

  /**
   * Нельзя создать дубль бумаги в качестве запланированной, если по этой бумаге уже есть покупки.
   */
  isPlanAvailable() {
    if (this.selectedInstrument) {
      return (this.bonds.find(b => b.ticker === this.selectedInstrument.ticker) == null);
    } else {
      return false;
    }
    return this.bonds.find(b => b.ticker === 'TBER') == null;
  }

  /**
   * Формируем заголовок модальной формы.
   */
  getModalFormName() {
    if (this.selectedPaper) {
      return this.selectedPaper.type === 'SHARE' ? 'Дивиденды по акции с тикером: ' + this.selectedPaper.ticker :
        'Купоны по облигации с тикером: ' + this.selectedPaper.ticker;
    } else {
      return 'Данные по купонам / дивидендам';
    }
  }

  /**
   * Закрыть календарь выплат.
   */
  closeCalendar() {
    this.isCalendarShown = false;
  }

  /**
   * Открыть модал с дивами / купонами.
   */
  openDivsModal() {
    this.isDivAndCouponModalShown = true;
  }

  /**
   * Закрыть модал с дивами / купонами.
   */
  closeDivModal() {
    this.isDivAndCouponModalShown = false;
  }

  /**
   * Открыть модал с доходами.
   */
  openReturnsModal() {
    this.isReturnsInfoShown = true;
  }

  /**
   * Закрыть модал с доходами.
   */
  closeReturnsModal() {
    this.isReturnsInfoShown = false;
  }

  /**
   * Закрыть модал с добавление инструмента.
   */
  closeAddInstrumentModal() {
    this.isAddDialogShown = false;
  }
}
