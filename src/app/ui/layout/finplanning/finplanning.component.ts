import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../service/http.service';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject, throwError, timer} from 'rxjs';
import {Subscription} from 'rxjs/Subscription';
import {CommonService} from '../../../service/common.service';
import {MessageCode} from '../../../service/message.code';
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
import {GetDetailedBalanceRq} from '../../../dto/GetDetailedBalanceRq';
import {BalanceDetailsRs} from '../../../dto/BalanceDetailsRs';
import {IncomeRs} from '../../../dto/IncomeRs';
import {GetLoansByDateRq} from '../../../dto/GetLoansByDateRq';
import {FullLoanRs} from '../../../dto/FullLoanRs';
import {NewGoalRq} from '../../../dto/NewGoalRq';
import {DeleteIncomesRq} from '../../../dto/DeleteIncomesRq';
import {Goal} from '../../../dto/Goal';
import {SalaryRs} from '../../../dto/SalaryRs';
import {SalaryRq} from '../../../dto/SalaryRq';
import { NewFreezeRq } from 'src/app/dto/NewFreezeRq';

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
  deleteIncomesUri = this.apiUri + '/income/delete'; // удаление доходов
  goalsUri = this.apiUri + '/goal'; // работа с целями
  balanceDetailUri = this.apiUri + '/remains'; // деталка по балансу
  loansByDate = this.apiUri + '/loan/bydate'; // кредиты по дате
  salaryUri = this.apiUri + '/salary';
  freezeUri = this.apiUri + '/freeze';

  // --------------------------------- ПЕРЕМЕННЫЕ -------------------------------------

  error: any; // отображение ошибок в алертах
  result: any; // отображение результатов в алертах
  isSalaryExists = false;
  isGoalForLoan = false; // цель для досрочки
  lastSalary = 0;
  curDateFormated = '';
  /**
   * При добавлении нового расхода данное поле управляет отображением всего блока кредитов и отправки запроса к бэку на список кредитов.
   */
  isDateNotNullForAddNewGoalForm = false;
  isLoanListByDateEmpty = true; // запросили список кредитов по дате - а он пустой (

// --------------------------------- ВКЛЮЧЕНИЕ МОДАЛОВ -------------------------------------

  isLoanEdit: boolean; // режим редактирования кредита
  isLoanAdd: boolean; // режим добавления кредита
  isAddIncome = false; // редактировать или добавить доход (отображение модала)
  isRemainsDetailInfoShown = false; // отображение деталки по остаткам.
  isIncomeDetailForm = false; // отображение деталки по доходам.
  isIncomeEditForm = false; // форма редактирования дохода.
  isGoalAddForm = false; // форма добавления цели,  расхода,  покупки
  isGoalEditForm = false; // форма редактирования целей
  isSelectedGoalEditForm = false; // форма редактирования выбранной цели
  isSalaryShow = false; // модал работы с зарплатами.
  isEditSalaryShow = false; // модал редактирования зарплаты
  isAddNewSalaryShow = false; // модал добавления расширенной ЗП
  isAddNewFreezeFormShow = false; // модал добавления фриза.
  // --------------------------------- ХРАНИЛИЩА -------------------------------------

  asyncList: Subject<FinPlan[]> = new Subject(); // асинхронный контейнер желаний
  finPlansList: FinPlan[] = []; // контейнер фин-планов
  goalsListForEdit: Goal[] = []; // для последующего редактирования целей
  goalsForEditDate: string; // дата для редактирования кредитов
  selectedIncomes: IncomeRs[] = []; // массив выделенных доходов для их правки
  selectedLoan: FullLoanRs; // выбранный кредит
  selectedGoal: Goal; // выбранный доход
  detailedBalanceContainer: Subject<BalanceDetailsRs> = new Subject<BalanceDetailsRs>(); // асинхронный контейнер деталки
  loansList: FullLoanRs[] = []; // асинхронный лист кредитов для подшивки досрочного погашения.
  salaryList: SalaryRs[] = [];
  selectedSalary: SalaryRs;
  selectedFinPlan: FinPlan;


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
    isBonus: ['', []],
    incomeDate: ['', [
      Validators.required
    ]],
    desc: ['', []]
  });

  editIncomeForm = this.fb.group({ // форма редактирования дохода
    income: ['', [
      Validators.required
    ]],
    isBonus: ['', [
      Validators.required
    ]],
    incomeDate: ['', [
      Validators.required
    ]],
    id: ['', [
      Validators.required
    ]],
    desc: ['', []]
  });

  addGoalForm = this.fb.group({ // форма добавления цели
    price: ['', [
      Validators.required
    ]],
    description: ['', []],
    startDate: ['', [
      Validators.required
    ]],
    isRepayment: ['', [
      Validators.required
    ]]
  });

  editGoalForm = this.fb.group({ // форма редактирования цели
    price: ['', [
      Validators.required
    ]],
    id: ['', [
      Validators.required
    ]],
    description: ['', []],
    startDate: ['', [
      Validators.required
    ]],
    repaymentId: ['', []]
  });

  editSalaryForm = this.fb.group({ // форма редактирования ЗП
    fullSalary: ['', [
      Validators.required
    ]],
    id: ['', []],
    residualSalary: ['', [
      Validators.required
    ]],
    salaryDate: ['', [
      Validators.required
    ]],
    livingExpenses: ['', [
      Validators.required
    ]]
  });

  addNewSalaryForm = this.fb.group({ // форма добавления новой ЗП
    fullSalary: ['', [
      Validators.required
    ]],
    id: ['', []],
    residualSalary: ['', [
      Validators.required
    ]],
    salaryDate: ['', [
      Validators.required
    ]],
    livingExpenses: ['', [
      Validators.required
    ]]
  });

  addNewFreezeForm = this.fb.group({ // форма добавления нового фриза
    amount: ['', [
      Validators.required
    ]]
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
    this.isRemainsDetailInfoShown = false;
    this.isIncomeEditForm = false;
    this.isIncomeDetailForm = false;
    this.loansList.length = 0;
    this.isLoanListByDateEmpty = true;
    this.isGoalEditForm = false;
    this.isGoalAddForm = false;
    this.goalsListForEdit = null;
    this.goalsForEditDate = null;
    this.selectedGoal = null;
    this.isGoalForLoan = false;
    this.isSelectedGoalEditForm = false;
    this.isSalaryShow = false;
    this.isAddNewSalaryShow = false;
    this.isEditSalaryShow = false;
    this.isAddNewFreezeFormShow = false;
    this.selectedFinPlan = null;

    console.log('error - ' + err.error);
    if (err.error === 'ERR-01') {
      this.error = 'У вас нет сохраненных зарплат! Невозможно посчитать сроки реализации! Добавьте хотя бы одну зарплату!';
      this.isSalaryExists = false;
      this.asyncList = null;
    } else if (err.error === 'ERR-02') {
      this.error = 'У вас нет сохраненных желаний! Добавьте хотя бы одно желание!';
      this.isSalaryExists = false;
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
    this.isRemainsDetailInfoShown = false;
    this.isIncomeDetailForm = false;
    this.isIncomeEditForm = false;
    this.isGoalEditForm = false;
    this.isGoalAddForm = false;
    this.error = '[' + code + '] ' + text;
    this.goalsListForEdit = null;
    this.goalsForEditDate = null;
    this.selectedGoal = null;
    this.isGoalForLoan = false;
    this.isSelectedGoalEditForm = false;
    this.isSalaryShow = false;
    this.isEditSalaryShow = false;
    this.isAddNewSalaryShow = false;
    this.isAddNewFreezeFormShow = false;
    this.selectedFinPlan = null;
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
    this.isRemainsDetailInfoShown = false;
    this.isIncomeDetailForm = false;
    this.isIncomeEditForm = false;
    this.isDateNotNullForAddNewGoalForm = false;
    this.loansList.length = 0;
    this.isLoanListByDateEmpty = true;
    this.isGoalEditForm = false;
    this.isGoalAddForm = false;
    this.goalsListForEdit = null;
    this.goalsForEditDate = null;
    this.selectedGoal = null;
    this.isGoalForLoan = false;
    this.isSelectedGoalEditForm = false;
    this.isSalaryShow = false;
    this.isEditSalaryShow = false;
    this.isAddNewSalaryShow = false;
    this.isAddNewFreezeFormShow = false;
    this.selectedFinPlan = null;

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
    if (!this.addIncomeForm.value.incomeDate) {
      selectedDate = moment(new Date(), DATE_TIME_FORMAT);
    } else {
      selectedDate = moment(this.addIncomeForm.value.incomeDate, DATE_TIME_FORMAT);
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

  /**
   * Отображение модала деталки по остаткам.
   *
   *  $event
   *  item
   */
  remainsModalShow(item: FinPlan) {
    this.getDetailedBalance(item);
  }

  /**
   * Отображение модала деталки по доходам.
   *
   *  $event
   *  item
   */
  detailedIncomesFormShow() {
    this.isIncomeDetailForm = true;
    this.isRemainsDetailInfoShown = false;
  }


  /**
   * Запросить с бэка детализованый баланс.
   *
   * item
   */
  private getDetailedBalance(item: FinPlan) {
    let request: GetDetailedBalanceRq;
    request = new GetDetailedBalanceRq(item.monthNumber, item.year);
    this.selectedFinPlan = item;
    this.httpService.getDetailedBalance(request, this.balanceDetailUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно  получить детализированные данные по балансу!');
      })
    ).subscribe(data => {
      this.detailedBalanceContainer.next(data);
      this.isRemainsDetailInfoShown = true;
    });
  }

  /**
   * Редактирование дохода.
   */
  showEditIncomeForm() {
    this.isIncomeEditForm = true;
    this.isIncomeDetailForm = false;
    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    const formattedDate = (moment(this.selectedIncomes[0].incomeDate)).format(DATE_TIME_FORMAT);
    console.log('Date formatted = ', formattedDate.toString());
    this.editIncomeForm.patchValue({
      income: this.selectedIncomes[0].amount,
      isBonus: this.selectedIncomes[0].isBonus,
      incomeDate: formattedDate.toString(),
      desc: this.selectedIncomes[0].incomeDescription,
      id: this.selectedIncomes[0].id
    });
  }

  /**
   * Редактировать доход.
   */
  editIncome() {
    let payload: NewIncomeRq;
    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    let currentDate: Moment;
    if (!this.editIncomeForm.value.incomeDate) {
      currentDate = moment(new Date(), DATE_TIME_FORMAT);
    } else {
      currentDate = moment(this.editIncomeForm.value.incomeDate, DATE_TIME_FORMAT);
    }

    payload = new NewIncomeRq();
    payload.income = this.editIncomeForm.value.income;
    payload.isBonus = this.editIncomeForm.value.isBonus === '' ? false : this.editIncomeForm.value.isBonus;
    payload.desc = this.editIncomeForm.value.desc;
    payload.incomeDate = currentDate.format('YYYY-MM-DD');
    payload.id = this.editIncomeForm.value.id;
    this.isIncomeEditForm = false;

    this.httpService.editIncome(payload, this.incomeUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно изменить доход!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Доход успешно изменен!');
        this.getMainDataFromDb();
        this.selectedIncomes.length = 0;
      }
    });
  }

  /**
   * Отображение формы добавления цели / расхода.
   */
  addGoalModalShow() {
    this.isGoalAddForm = true;
    this.addGoalForm.patchValue({
      price: '',
      description: '',
      startDate: '',
      isRepayment: false
    });
  }

  /**
   * Выбрали дату в окне добавления нового расхода.
   *
   * event - выбранная дата.
   */
  toggleDateNotNull(event: any) {
    if (event != null) {
      console.log('event = ', event);
      this.isDateNotNullForAddNewGoalForm = true;
    } else {
      this.isDateNotNullForAddNewGoalForm = false;
    }

    if (this.addGoalForm.value.isRepayment) {
      this.loansList.length = 0;
      this.repaymentToggle(event);
    }
  }

  /**
   * Переключили переключатель "это погашение кредита" при добавлении расхода.
   *
   * $event
   */
  repaymentToggle(event: any) {

    let currentDate: Moment;
    if (event != null) {
      currentDate = moment(Date.parse(event));
      if (currentDate == null) {
        currentDate = moment(new Date(), 'DD/MM/YYYY');
      }
    } else {
      currentDate = moment(Date.parse(this.addGoalForm.value.startDate));
      if (currentDate == null) {
        currentDate = moment(new Date(), 'DD/MM/YYYY');
      }
    }
    let payload: GetLoansByDateRq;
    payload = new GetLoansByDateRq();
    payload.startDate = currentDate.format('YYYY-MM-DD');
    this.httpService.getLoansByDate(payload, this.loansByDate).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно Загрузить кредиты!');
      })
    ).subscribe(data => {
      if (data.loansList == null || data.loansList.length === 0) {
        this.isLoanListByDateEmpty = true;
      } else {
        this.isLoanListByDateEmpty = false;
        this.loansList = data.loansList;
      }
    });

  }

  /**
   * Добавить цель / трату.
   *
   */
  addGoal() {
    let payload: NewGoalRq;
    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    let selectedDate: Moment;
    if (!this.addGoalForm.value.startDate) {
      selectedDate = moment(new Date(), DATE_TIME_FORMAT);
    } else {
      selectedDate = moment(this.addGoalForm.value.startDate, DATE_TIME_FORMAT);
    }

    payload = new NewGoalRq();
    payload.description = this.addGoalForm.value.description;
    payload.price = this.addGoalForm.value.price;
    payload.startDate = selectedDate.format('YYYY-MM-DD');

    if (this.selectedLoan != null) {
      payload.repayment = this.selectedLoan.id;
    }

    this.httpService.addGoal(payload, this.goalsUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно добавить цель!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Цель успешно добавлена! ID дохода - ' + data.id);
        this.getMainDataFromDb();
      }
    });
  }

  /**
   * От
   *  $event
   *  item
   */
  showEditGoalsListModal($event: MouseEvent, item: FinPlan) {
    this.isGoalEditForm = true;
    this.goalsListForEdit = item.purchasePlan.purchasePlan;
    this.goalsForEditDate = item.month + ' ' + item.year;
  }

  /**
   * Удалить доходы.
   */
  deleteIncomes() {
    let payload: DeleteIncomesRq;
    payload = new DeleteIncomesRq();
    payload.idList = this.selectedIncomes;
    this.isIncomeEditForm = false;

    this.httpService.deleteIncomes(payload, this.deleteIncomesUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно удалить доходы!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Доходы успешно удалены!');
        this.getMainDataFromDb();
        this.selectedIncomes.length = 0;
      }
    });
  }

  /**
   * Отобразить форму редактирования выбранного дохода.
   */
  showEditSelectedIncomeForm() {
    this.goalsListForEdit = null;
    this.isSelectedGoalEditForm = true;
    this.isGoalEditForm = false;
    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    const formattedDate = (moment(this.selectedGoal.startDate)).format(DATE_TIME_FORMAT);
    console.log('Date = ', formattedDate.toString());

    this.editGoalForm.patchValue({
      id: this.selectedGoal.id,
      description: this.selectedGoal.description,
      price: this.selectedGoal.price,
      startDate: formattedDate.toString(),
      repaymentId: this.selectedGoal.loanId
    });

    this.isGoalForLoan = this.selectedGoal.loanId != null;
  }

  /**
   * Отправить на бэк запрос на редактирование цели.
   */
  editGoal() {
    let payload: NewGoalRq;
    payload = new NewGoalRq();
    payload.description = this.editGoalForm.value.description;
    payload.price = this.editGoalForm.value.price;
    payload.id = this.editGoalForm.value.id;

    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    let currentDate: Moment;
    if (this.editGoalForm.value.startDate) {
      currentDate = moment(this.editGoalForm.value.startDate, DATE_TIME_FORMAT);
      payload.startDate = currentDate.format('YYYY-MM-DD');
    }

    this.httpService.editGoal(payload, this.goalsUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно изменить цель!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Цель успешно изменена!');
        this.getMainDataFromDb();
      }
    });
  }

  /**
   * Удалить Цель.
   */
  deleteSelectedGoal() {
    this.httpService.deleteFinPlanningEntity(this.selectedGoal.id, this.goalsUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно удалить цель!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Цель успешно удалена!');
        this.getMainDataFromDb();
      }
    });
  }

  /**
   * Отображение окна расширенной работы с зарплатами.
   *
   */
  salaryModalShow() {
    this.isSalaryShow = true;
    this.httpService.getData(this.salaryUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно загрузить зарплаты!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.salaryList = data.salariesList;
      }
    });
  }

  /**
   * Редактировать зарплату.
   *
   */
  editSalary() {
    let payload: SalaryRq;
    payload = new SalaryRq();
    payload.id = this.editSalaryForm.value.id;
    payload.fullSalary = this.editSalaryForm.value.fullSalary;
    payload.residualSalary = this.editSalaryForm.value.residualSalary;
    payload.livingExpenses = this.editSalaryForm.value.livingExpenses;

    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    let currentDate: Moment;
    if (this.editSalaryForm.value.salaryDate) {
      currentDate = moment(this.editSalaryForm.value.salaryDate, DATE_TIME_FORMAT);
      payload.salaryDate = currentDate.format('YYYY-MM-DD');
    }

    this.httpService.editSalary(payload, this.salaryUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно изменить зарплату!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Зарплата успешно изменена!');
        this.getMainDataFromDb();
      }
    });
  }

  /**
   * Отобразить модал редактирования ЗП.
   */
  showEditSalaryModal() {
    this.isEditSalaryShow = true;
    this.isSalaryShow = false;

    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    const formattedDate = (moment(this.selectedSalary.salaryDate)).format(DATE_TIME_FORMAT);
    console.log('Date = ', formattedDate.toString());

    this.editSalaryForm.patchValue({
      id: this.selectedSalary.id,
      fullSalary: this.selectedSalary.fullSalary,
      residualSalary: this.selectedSalary.residualSalary,
      salaryDate: formattedDate.toString(),
      livingExpenses: this.selectedSalary.livingExpenses
    });
  }

  /**
   * Отобразить окно добавления ЗП.
   *
   */
  showAddSalaryModal() {
    this.isEditSalaryShow = false;
    this.isSalaryShow = false;
    this.isAddNewSalaryShow = true;
    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    const formattedDate = (moment(new Date())).format(DATE_TIME_FORMAT);
    console.log('Date = ', formattedDate.toString());

    this.addNewSalaryForm.patchValue({
      id: '',
      fullSalary: '',
      residualSalary: '',
      salaryDate: formattedDate.toString(),
      livingExpenses: ''
    });
  }

  /**
   * Добавить новую ЗП.
   */
  addSalary() {
    let payload: SalaryRq;
    payload = new SalaryRq();
    payload.id = this.addNewSalaryForm.value.id;
    payload.fullSalary = this.addNewSalaryForm.value.fullSalary;
    payload.residualSalary = this.addNewSalaryForm.value.residualSalary;
    payload.livingExpenses = this.addNewSalaryForm.value.livingExpenses;

    const DATE_TIME_FORMAT = 'MM/DD/YYYY';
    let currentDate: Moment;
    if (this.addNewSalaryForm.value.salaryDate) {
      currentDate = moment(this.addNewSalaryForm.value.salaryDate, DATE_TIME_FORMAT);
      payload.salaryDate = currentDate.format('YYYY-MM-DD');
    }

    this.httpService.addSalary(payload, this.salaryUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно добавить зарплату!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Зарплата успешно добавлена!');
        this.getMainDataFromDb();
      }
    });
  }

  /**
   * Удалить ЗП.
   */
  deleteSelectedSalary() {
    this.httpService.deleteFinPlanningEntity(this.selectedSalary.id, this.salaryUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно удалить зарплату!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Зарплата успешно удалена!');
        this.getMainDataFromDb();
      }
    });
  }

  /**
   * Отображение модала добавления Фриза.
   */
  addFreezeModalShow() {
    this.isAddNewFreezeFormShow = true;
    console.log('Selected month',  this.selectedFinPlan.monthNumber);
    console.log('Selected year',  this.selectedFinPlan.year);
    this.addNewFreezeForm.patchValue({
      amount: ''
    });
  }


  /**
   * Добавить фриз.
   */
  addFreeze() {
    let payload: NewFreezeRq;
    payload = new NewFreezeRq();
    payload.amount = this.addNewFreezeForm.value.amount;
    payload.year = this.selectedFinPlan.year;
    payload.month = this.selectedFinPlan.monthNumber;

    this.httpService.addFreeze(payload, this.freezeUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно добавить фриз!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Фриз успешно добавлен! ID фриза - ' + data.id);
        this.getMainDataFromDb();
      }
    });
  }

  /**
   * Удалить фриз.
   */
  deleteFreeze() {
    this.httpService.deleteFreeze(this.selectedFinPlan, this.freezeUri).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно удалить фриз!');
      })
    ).subscribe(data => {
      if (data.status.code !== 200) {
        this.forcedErrorAlertWithoutError(data.status.description, data.status.code);
        this.getMainDataFromCache();
      } else {
        this.showAlert('Фриз успешно удален!');
        this.getMainDataFromDb();
      }
    });
  }
}
