import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../service/http.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {Observable, Subject, throwError, timer} from 'rxjs';
import {Subscription} from 'rxjs/Subscription';
import {CommonService} from '../../../service/common.service';
import {MessageCode} from '../../../service/message.code';
import {WishListGroup} from '../../../dto/wish-list-group';
import {environment} from '../../../../environments/environment';
import {DatePipe} from '@angular/common';
import {catchError} from 'rxjs/operators';
import {FinPlan} from '../../../dto/finplan';
import {Moment} from 'moment';
import * as moment from 'moment';
import {NewLoanRq} from '../../../dto/NewLoanRq';
import {Credit} from '../../../dto/Credit';
import {EditLoanRq} from '../../../dto/EditLoanRq';
import {NewIncomeRq} from '../../../dto/NewIncomeRq';

@Component({
  selector: 'app-fin-planning',
  templateUrl: 'finplanning.component.html',
  providers: [HttpService, DatePipe],
  styleUrls: ['./finplanning.component.css']
})
export class FinPlanningComponent implements OnInit {

  // --------------------------------- URL'ы -------------------------------------

  SERVER_URL: string = environment.serverUrl;
  apiUri = this.SERVER_URL + '/finplanning';
  consolidatedListFromCacheUri = this.apiUri + '/consolidated'; // полная консолидированная таблица
  consolidatedListFromDbUri = this.apiUri + '/consolidated/db'; // полная консолидированная таблица
  getLoanByIdUrl = this.apiUri + '/loan'; // получить кредит по id
  loanUri = this.apiUri + '/loan'; // работа с кредитами
  incomeUri = this.apiUri + '/income'; // работа с доходами

  // --------------------------------- ПЕРЕМЕННЫЕ -------------------------------------

  error: any; // отображение ошибок в алертах
  result: any; // отображение результатов в алертах
  isSalaryExists = false;
  lastSalary = 0;
  curDateFormated = '';

// --------------------------------- ВКЛЮЧЕНИЕ МОДАЛОВ -------------------------------------

  isLoanEdit: boolean; // режим редактирования кредита
  isLoanAdd: boolean; // режим добавления кредита
  isAddIncome = false; // редактировать или добавить доход (отображение модала)
  isCsvParse = false; // отправить на парсинг csv
  isFilterModal: boolean; // вывести модал поиска
  isMonthGroupModeWishEdit = false; // вывод формы редактирования желания при помесячной группировке
  isSummInfoForm = false; // вывод формы с итоговой информацией (сумма всех желаний, время реализации)

  // --------------------------------- ХРАНИЛИЩА -------------------------------------

  asyncList: Subject<FinPlan[]> = new Subject(); // асинхронный контейнер желаний
  finPlansList: FinPlan[] = []; // контейнер фин-планов
  wishGroups: WishListGroup[] = []; // контейнер желаний
  asyncWishGroups: Subject<WishListGroup[]> = new Subject(); // асинхронный контейнер желаний с помесячной группировкой
  monthList = []; // контейнер месяцев

  filterTypes = ['Все', 'Приоритет', 'Очистить фильтр', 'Помесячная группировка']; // фильтры
  groupMonthSort = ['Без сортировки', 'По имени', 'По сумме [1..10]', 'По сумме [10..1]']; // сортировка помесячной группировки

  // --------------------------------- ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ И ЕГО ДАННЫЕ -------------------------------------

  userRole: string;
  private subscription: Subscription;
  globalError: MessageCode;

  // --------------------------------- ФОРМЫ -------------------------------------
  addCreditForm = this.fb.group({ // форма добавления кредита
    startAmount: ['', [
      Validators.required
    ]],
    fullPayPerMonth: ['', [
      Validators.required
    ]],
    realPayPerMonth: ['', [
      Validators.required
    ]],
    startDate: ['', [
      Validators.required
    ]],
    desc: ['', []]
  });

  editCreditForm = this.fb.group({ // форма редактирования кредита
    startAmount: ['', [
      Validators.required
    ]],
    id: ['', [
      Validators.required
    ]],
    fullPayPerMonth: ['', [
      Validators.required
    ]],
    realPayPerMonth: ['', [
      Validators.required
    ]],
    loanNumber: ['', [
      Validators.required
    ]],
    startDate: ['', [
      Validators.required
    ]],
    desc: ['', []]
  });

  addIncomeForm = this.fb.group({ // форма добавления дохода
    income: ['', [
      Validators.required
    ]],
    isBonus: ['', [
      Validators.required
    ]],
    loanNumber: ['', [
      Validators.required
    ]],
    incomeDate: ['', [
      Validators.required
    ]],
    desc: ['', []]
  });

  constructor(private commonService: CommonService, private httpService: HttpService, private fb: FormBuilder,
              private datePipe: DatePipe) {
    this.curDateFormated = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  }

  ngOnInit() {
    console.log('Идем сюда - ', this.consolidatedListFromCacheUri);
    this.getMainDataFromCache();
    this.subscription = this.commonService.error$.subscribe(error => {
      if (error == null) {
        this.globalError = new MessageCode();
        this.globalError.messageType = 'NO ERRORS';
      } else {
        this.globalError = error;
        this.isLoanEdit = false;

        if (this.globalError.messageType === this.globalError.AUTH_LOGIN_OK) {
        } else if (this.globalError.messageType === this.globalError.USER_DATA_CHANGE_OK) {
          this.isLoanEdit = false;
          this.result = this.globalError.USER_DATA_CHANGE_OK;
          timer(4000).subscribe(() => {
            this.result = null;
          });
        } else {
          this.error = error.messageType;
          timer(4000).subscribe(() => {
            this.error = null;
          });
        }
      }
    });
  }

  /**
   *  Получить полную консолидированную таблицу из кэша.
   *
   */
  getMainDataFromCache() {
    this.httpService.getData(this.consolidatedListFromCacheUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить данные!');
      })
    ).subscribe(data => {
      this.finPlansList = data.finPlans;
    });
  }

  /**
   *  Получить полную консолидированную таблицу из кэша.
   *
   */
  getMainDataFromDb() {
    this.httpService.getData(this.consolidatedListFromDbUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить данные!');
      })
    ).subscribe(data => {
      this.finPlansList = data.finPlans;
    });
  }


  getLoanById(id: number) {
    this.httpService.getData(this.getLoanByIdUrl + '?id=' + id).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить данные!');
      })
    ).subscribe(data => {

      let loan: Credit;
      loan = data;
      console.log('Получили = ', loan);
      const DATE_TIME_FORMAT = 'MM/DD/YYYY';
      const formattedDate = (moment(loan.startDate)).format(DATE_TIME_FORMAT);
      console.log('Date = ', formattedDate.toString());
      this.isLoanEdit = true;
      this.editCreditForm.patchValue({
        startAmount: loan.amount,
        id: loan.id,
        loanNumber: loan.number,
        startDate: (formattedDate.toString()),
        fullPayPerMonth: loan.fullPayPerMonth,
        realPayPerMonth: loan.realPayPerMonth,
        desc: loan.description
      });
    });
  }

  /**
   *  Отобразить окно "Добавить кредит".
   *
   */
  addCreditModalShow() {
    this.isLoanAdd = true;
    this.addCreditForm.patchValue({
      startAmount: '',
      fullPayPerMonth: '',
      realPayPerMonth: '',
      startDate: ''
    });
  }

  /**
   *  Отобразить окно "Добавить доход".
   *
   */
  addIncomeModalShow() {
    this.isAddIncome = true;
    this.addCreditForm.patchValue({
      startAmount: '',
      fullPayPerMonth: '',
      realPayPerMonth: '',
      startDate: ''
    });
  }

  /**
   *  Отобразить окно "Редактировать или удалить кредит".
   *
   */
  editCreditModalShow(event: any, item: FinPlan, creditNumber: number) {
    console.log('Вы выбрали item № = ', creditNumber);

    let loan: Credit;
    loan = item.credits.find(x => x.number === creditNumber);
    console.log('Нашли кредит № = ', loan.id);
    this.getLoanById(loan.id);
  }

  /**
   *  Удалить кредит.
   *
   */
  deleteLoan() {

    this.httpService.deleteFinPlanningEntity(this.editCreditForm.value.id, this.loanUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно удалить кредит!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Кредит успешно удален! Всего - ' + data.creditsCount);
        this.getMainDataFromDb();
      }
    });
  }

  /**
   *  Пульнуть запрос бэку на изменение кредита.
   *
   */
  editLoan() {
    let payload: EditLoanRq;
    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    let currentDate: Moment;
    if (!this.editCreditForm.value.startDate) {
      currentDate = moment(new Date(), DATE_TIME_FORMAT);
    } else {
      currentDate = moment(this.editCreditForm.value.startDate, DATE_TIME_FORMAT);
    }

    payload = new EditLoanRq(this.editCreditForm.value.id,
      this.editCreditForm.value.desc,
      this.editCreditForm.value.startAmount,
      this.editCreditForm.value.fullPayPerMonth,
      this.editCreditForm.value.realPayPerMonth,
      currentDate.format('YYYY-MM-DD'));

    this.httpService.editLoan(payload, this.loanUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно изменить кредит!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Кредит успешно изменен! Всего - ' + data.creditsCount);
        this.getMainDataFromDb();
      }
    });
  }

  /**
   *  Пульнуть запрос бэку на создание нового кредита.
   *
   */
  addLoan() {
    let payload: NewLoanRq;
    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    let currentDate: Moment;
    if (!this.addCreditForm.value.startDate) {
      currentDate = moment(new Date(), DATE_TIME_FORMAT);
    } else {
      currentDate = moment(this.addCreditForm.value.startDate, DATE_TIME_FORMAT);
    }

    payload = new NewLoanRq(this.addCreditForm.value.startAmount,
      this.addCreditForm.value.fullPayPerMonth,
      this.addCreditForm.value.realPayPerMonth,
      currentDate.format('YYYY-MM-DD'),
      this.addCreditForm.value.desc);

    this.httpService.addLoan(payload, this.loanUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно добавить кредит!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Кредит успешно добавлен! Номер - ' + data.creditNumber + '. Всего - ' + data.creditsCount);
        this.getMainDataFromDb();
      }
    });
  }


  /**
   * Обработчик ошибок.
   *
   * err
   * message
   */
  errorHandler(err, message: string) {
    this.isLoanEdit = false;
    this.isLoanAdd = false;
    this.isAddIncome = false;
    console.log('error - ' + err.error);
    if (err.error === 'ERR-01') {
      this.error = 'У вас нет сохраненных зарплат! Невозможно посчитать сроки реализации! Добавьте хотя бы одну зарплату!';
      this.isSalaryExists = false;
      this.asyncList = null;
      this.filterTypes = ['Все', 'Приоритет', 'Очистить фильтр'];
    } else if (err.error === 'ERR-02') {
      this.error = 'У вас нет сохраненных желаний! Добавьте хотя бы одно желание!';
      this.isSalaryExists = false;
      this.filterTypes = ['Все', 'Приоритет', 'Очистить фильтр'];
    } else {
      this.error = message;
    }
    console.log(err);
    timer(4000).subscribe(() => {
      this.error = null;
    });
    return throwError(err);
  }

  /**
   * Временный метод проброса ошибки - потом разберемся, когда проведем единый рефакторинг ошибок для фронта и бека.
   */
  forcedErrorAlertWithoutError(text: string, code: string) {
    this.isLoanAdd = false;
    this.isLoanEdit = false;
    this.isAddIncome = false;
    this.result = text;
    this.error = '[' + code + '] ' + text;
    timer(4000).subscribe(() => {
      this.result = null;
      this.error = null;
    });
  }

  showAlert(text: string) {
    this.isLoanEdit = false;
    this.isLoanAdd = false;
    this.isAddIncome = false;
    this.result = text;
    timer(4000).subscribe(() => {
      this.result = null;
    });
  }

  /**
   * Добавить доход.
   */
  addIncome() {
    let payload: NewIncomeRq;
    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    let selectedDate: Moment;
    if (!this.addIncomeForm.value.startDate) {
      selectedDate = moment(new Date(), DATE_TIME_FORMAT);
    } else {
      selectedDate = moment(this.addCreditForm.value.startDate, DATE_TIME_FORMAT);
    }

    payload = new NewIncomeRq();
    payload.income = this.addIncomeForm.value.income;
    payload.isBonus = this.addIncomeForm.value.isBonus === '' ? false : this.addIncomeForm.value.isBonus;
    payload.desc = this.addIncomeForm.value.desc;
    payload.incomeDate = selectedDate.format('YYYY-MM-DD');

    this.httpService.addIncome(payload, this.incomeUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно добавить доход!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Доход успешно добавлен! ID дохода - ' + data.id);
        this.getMainDataFromDb();
      }
    });
  }
}
