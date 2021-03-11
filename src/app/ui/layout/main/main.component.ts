import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../service/http.service';
import {Wish} from '../../../dto/wish';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subject, throwError, timer} from 'rxjs';
import {Subscription} from 'rxjs/Subscription';
import {catchError, tap} from 'rxjs/operators';
import {Salary} from '../../../dto/salary';
import {HttpParams} from '@angular/common/http';
import {CommonService} from '../../../service/common.service';
import {MessageCode} from '../../../service/message.code';
import {environment} from '../../../../environments/environment';
import {DatePipe} from '@angular/common';
import {SearchRq} from '../../../dto/searchwishes';

@Component({
  selector: 'app-main',
  templateUrl: 'main.component.html',
  providers: [HttpService, DatePipe],
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  // --------------------------------- URL'ы -------------------------------------

  SERVER_URL: string = environment.serverUrl;
  myBaseUrl = this.SERVER_URL + '/rest/wishes';
  apiUrl = this.myBaseUrl; // все желания // основная ссылка на api
  priorityWishesFilterUrl = this.myBaseUrl + '?filter=PRIOR'; // приоритетные желания
  allWishesFilterUrl = this.myBaseUrl + '?filter=ALL'; // все желания
  clearWishesFilterUrl = this.myBaseUrl + '?filter=NONE'; // очистить фильтр желаний
  sortWishesByNameUrl = this.myBaseUrl + '?sort=NAME'; // очистить фильтр желаний
  sortWishesByPriceAscUrl = this.myBaseUrl + '?sort=PRICE_ASC'; // очистить фильтр желаний
  sortWishesByPriceDescUrl = this.myBaseUrl + '?sort=PRICE_DESC'; // очистить фильтр желаний
  sortWishesByPriorityUrl = this.myBaseUrl + '?sort=PRIOR'; // очистить фильтр желаний
  wishesWithoutSortUrl = this.myBaseUrl + '?sort=ALL'; // очистить фильтр желаний
  apiGetSumm = this.myBaseUrl + '/summ'; // ссылка для получения сумм
  apiSalary = this.myBaseUrl + '/salary'; // ссылка для получения сумм
  parseUrl = this.myBaseUrl + '/parsecsv'; // url для парсинга csv
  changePriorityUrl = this.myBaseUrl + '/changepriority'; // url для быстрого изменения приоритета
  searchWishesUrl = this.myBaseUrl + '/filter'; // поиск желаний


  // --------------------------------- ПЕРЕМЕННЫЕ -------------------------------------

  cryptokey = ''; // пользовательский ключ шифрования
  error: any; // отображение ошибок в алертах
  result: any; // отображение результатов в алертах
  summAll = 0; // отображение сум по всем желаниям
  summPriority = 0; // отображение сум по приоритетным желаниям
  periodAll = 0; // период реализации для всего
  periodPriority = 0; // период реализации для приоритетного
  implementationPeriod = ''; // средний период реализации желаний
  implemetedSummAllTime = ''; // общая сумма реализованного за все время
  implemetedSummMonth = ''; // общая сумма реализованного за текущий месяц


  filterMode = false; // период реализации для приоритетного
  filterButtonText = 'ПОИСК/ФИЛЬТР'; // период реализации для приоритетного
  monthOrdermode = false; // режим отображение дерева группировки по месяцам
  isSalaryExists = false;
  lastSalary = 0;
  curDateFormated = '';

// --------------------------------- ВКЛЮЧЕНИЕ МОДАЛОВ -------------------------------------

  isEdit: boolean; // режим редактирования для отображения / или чтобы спрятать модальное окно
  isSalaryAdd: boolean; // режим добавления зп
  isEditMode = false; // редактировать или добавить
  isCsvParse = false; // отправить на парсинг csv
  isFilterModal: boolean; // вывести модал поиска
  isSummInfoForm = false; // вывод формы с итоговой информацией (сумма всех желаний, время реализации)

  // --------------------------------- ХРАНИЛИЩА -------------------------------------

  asyncWishList: Subject<Wish[]> = new Subject(); // асинхронный контейнер желаний
  filterTypes = ['Все', 'Приоритет', 'Очистить фильтр']; // фильтры
  mainSort = ['По имени', 'По сумме [1..10]', 'По сумме [10..1]', 'По приоритету', 'Без сортировки']; // сортировка помесячной группировки

  // --------------------------------- ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ И ЕГО ДАННЫЕ -------------------------------------

  isUserCrypto: boolean;
  userRole: string;
  private subscription: Subscription;
  globalError: MessageCode;

  // --------------------------------- ФОРМЫ -------------------------------------
  uploadForm: FormGroup; // Основная форма добавления / редактирования желаний
  form = this.fb.group({
    id: ['', []],
    name: ['', [
      Validators.required,
      Validators.maxLength(160),
    ]],
    description: ['', []],
    url: ['', []],
    priority: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]+$/)
    ]],
    price: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]+$/)
    ]],
    creationDate: ['', []]
  });

  salaryForm = this.fb.group({ // форма ввода / редактирования зарплаты
    salary: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]+$/)
    ]],
    residualSalary: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]+$/)
    ]]
  });

  csvForm = this.fb.group({ // форма парсинга csv
    csvfile: ['', []]
  });

  filterForm = this.fb.group({ // форма включения / выклюяения фильтров
    wish: ['', [
      Validators.required
    ]]
  });

  constructor(private commonService: CommonService, private httpService: HttpService, private fb: FormBuilder,
              private datePipe: DatePipe) {
    this.curDateFormated = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  }

  ngOnInit() {

    this.getWishes(this.apiUrl);
    this.uploadForm = this.fb.group({
      profile: ['']
    });

    this.subscription = this.commonService.error$.subscribe(error => {

      if (error == null) {
        this.globalError = new MessageCode();
        this.globalError.messageType = 'NO ERRORS';
      } else {
        this.globalError = error;
        this.isEdit = false;
        this.isSalaryAdd = false;

        if (this.globalError.messageType === this.globalError.AUTH_LOGIN_OK) {
          this.getWishes(this.apiUrl);

        } else if (this.globalError.messageType === this.globalError.USER_DATA_CHANGE_OK) {
          this.isEdit = false;
          this.isSalaryAdd = false;
          this.isCsvParse = false;
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

    // Закрываем пункт меню группировки по месяцам если нет зарплат

    if (this.isSalaryExists) {
      this.filterTypes = ['Все', 'Приоритет', 'Очистить фильтр']; // фильтры
    } else {
      this.filterTypes = ['Все', 'Приоритет', 'Очистить фильтр']; // фильтры
    }
  }

  /**
   * Изменить сортировку основной таблицы
   *
   * item - тип сортировки.
   */
  sortMainList(item: string) {

    if (item === 'По имени') {
      this.getWishes(this.sortWishesByNameUrl);
    } else if (item === 'По сумме [1..10]') {
      this.getWishes(this.sortWishesByPriceAscUrl);
    } else if (item === 'По сумме [10..1]') {
      this.getWishes(this.sortWishesByPriceDescUrl);
    } else if (item === 'По приоритету') {
      this.getWishes(this.sortWishesByPriorityUrl);
    } else {
      this.getWishes(this.wishesWithoutSortUrl);
    }
  }

  /**
   * Фильтрация списка желаний: ALL / PRIOR / NONE
   * item - выбранный тип фильтрации
   */
  changeFilter(item: string) {

    if (item === 'Все') {
      this.getWishes(this.allWishesFilterUrl);
    } else if (item === 'Очистить фильтр') {
      this.getWishes(this.clearWishesFilterUrl);
    } else {
      this.getWishes(this.priorityWishesFilterUrl);
    }
  }

  // Загрузить все желания в табличном режиме.
  getWishes(url: string) {

    this.httpService.getData(url).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить желания!');
      })
    ).subscribe(data => {
      this.asyncWishList.next(data.list);
    });

    this.httpService.getData(this.apiGetSumm).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно посчитать итоговые стоимости!');
      })
    ).subscribe(data => {
      this.summAll = data.all;
      this.summPriority = data.priority;
      this.periodAll = data.allPeriodForImplementation;
      this.periodPriority = data.priorityPeriodForImplementation;
      this.implementationPeriod = data.averageImplementationTime;
      this.implemetedSummAllTime = data.implemetedSummAllTime;
      this.implemetedSummMonth = data.implemetedSummMonth;
      this.isSalaryExists = true;
      this.lastSalary = data.lastSalary;
      this.filterTypes = ['Все', 'Приоритет', 'Очистить фильтр'];
      console.log('Sal: ' + data.lastSalary);
    });
  }

  /**
   * Поиск желаний.
   */
  searchWishes() {

    const payload = new SearchRq(this.filterForm.value.wish);
    this.closeSearchModal();
    this.httpService.searchWishes(payload, this.searchWishesUrl).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно найти желания!');
      })
    ).subscribe(data => {
      this.asyncWishList.next(data.list);
    });
  }

  deleteWish() {
    this.httpService.deleteWish(this.form.value.id, this.myBaseUrl).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно удалить желание!');
      })
    ).subscribe(res => {
        this.showAlert('Желание с id [' + this.form.value.id + '] успешно удалено!', 'ADD MODE', res);
      });
  }

  errorHandler(err, message: string) {
    this.isEdit = false;
    this.isSalaryAdd = false;
    console.log('error - ' + err.error);
    if (err.error === 'ERR-01') {
      this.error = 'У вас нет сохраненных зарплат! Невозможно посчитать сроки реализации! Добавьте хотя бы одну зарплату!';
      this.isSalaryExists = false;
      // this.wishes = null;
      this.asyncWishList = null;
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

  openEditWish(event: any, item: Wish, isedit: number) {

      this.isEdit = true;
      if (isedit === 1) {
        this.isEditMode = true;
        this.form.patchValue({
          id: item.id,
          name: item.wish,
          description: item.description,
          url: item.url,
          priority: item.priority,
          price: item.price,
          creationDate: item.creationDate
        });
      } else {
        this.isEditMode = false;
        this.form.patchValue({
          id: 1,
          name: '',
          description: 'какое-то описание',
          url: '',
          priority: 1,
          price: 0,
          creationDate: this.curDateFormated
        });
      }
  }

  onFileSelect(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get('profile').setValue(file);
    }
  }

  // Отправить файл на парсинг
  onSubmit() {
    const formData = new FormData();
    formData.append('csvfile', this.uploadForm.get('profile').value);
    console.log(this.uploadForm.get('profile').value);
    this.httpService.sendFile(formData, this.parseUrl).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно спарсить файл !');
      })
    ).subscribe(res => {
      console.log(res);
      this.showAlert('Парсинг выполнен! Добавлено: ' + res.itemsAdded + ' желаний!', 'PARSE MODE', res);
    });

  }

  // Открыть диалог выбора csv-файла для парсинга на сервере.
  openParseCsv(event: any) {
    this.isCsvParse = true;
  }

  // Добавить в Мультипар-форму подгруженый csv-файл
  sendCsvFile() {
    const reader = new FileReader();
    const file = this.csvForm.value.csvfile;
    reader.readAsArrayBuffer(file);
    console.log(file.name);
    this.isCsvParse = false;
  }

  openAddSalaryModal(event: any) {

    this.isSalaryAdd = true;
    this.isEditMode = false;
    this.isEditMode = false;

    this.salaryForm.patchValue({
      salary: 1,
      residualSalary: 1
    });
  }

  showAlert(text: string, mode: string, result: any) {
    this.isEdit = false;
    this.isSalaryAdd = false;
    this.isCsvParse = false;
    this.result = text;
    timer(4000).subscribe(() => {
      this.result = null;
    });
  }

  addSalary() {
    const salary = new Salary(this.salaryForm.value.salary, this.salaryForm.value.residualSalary);
    this.closeSalaryModal();
    this.httpService.sendSalary(salary, this.apiSalary).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно добавить зарплату!');
      })
    ).subscribe(hero => {
      this.showAlert('Зарплата успешно обновлена!', 'ADD MODE', hero);
      this.getWishes(this.apiUrl);
    });
  }

  realizeWish() {
    const wish = new Wish(this.form.value.id,
      this.form.value.name,
      this.form.value.price,
      this.form.value.priority,
      false,
      this.form.value.description,
      this.form.value.url,
      true
    );

    this.httpService.updateWish(wish, this.myBaseUrl).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно обновить желание!');
      })
    ).subscribe(hero => {
      this.showAlert('Желание с id [' + wish.id + '] успешно обновлено!', 'ADD MODE', hero);
      this.getWishes(this.apiUrl);
    });
  }


  addEditWish() {

    const wish = new Wish(this.form.value.id,
      this.form.value.name,
      this.form.value.price,
      this.form.value.priority,
      false,
      this.form.value.description,
      this.form.value.url,
      false
    );

    if (!this.cryptokey) {
      console.log('cryptokey is null. Try to fix it');
      this.cryptokey = localStorage.getItem('cryptokey');
    }

    if (this.isUserCrypto) {
      wish.wish = this.commonService.convertText('encrypt', wish.wish, this.cryptokey);
      wish.description = this.commonService.convertText('encrypt', wish.description, this.cryptokey);
      wish.url = this.commonService.convertText('encrypt', wish.url, this.cryptokey);
      console.log('encrypted wish', wish.wish);
    }

    if (this.isEditMode) {
      this.httpService.updateWish(wish, this.myBaseUrl).pipe(
        catchError(err => {
          return this.errorHandler(err, 'Невозможно обновить желание!');
        })
      ).subscribe(hero => {
        this.showAlert('Желание с id [' + wish.id + '] успешно обновлено!', 'ADD MODE', hero);
        this.getWishes(this.apiUrl);
      });

    } else {
      this.httpService.sendData(wish, this.myBaseUrl).pipe(
        catchError(err => {
          return this.errorHandler(err, 'Невозможно добавить желание!');
        })
      ).subscribe(hero => {
        this.showAlert('Желание успешно добавлено!', 'ADD MODE', hero);
        this.getWishes(this.apiUrl);
      });
    }
  }

  changePriority(item: Wish, move: string) {

    console.log('change priority');
    console.log('URL ->' + this.changePriorityUrl + '/' + item.id + '/' + move);
    this.httpService.getData(this.changePriorityUrl + '/' + item.id + '/' + move).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно изменить приоритет!');
      })
    ).subscribe(res => {
      console.log(res);
      this.showAlert('Приоритет успешно изменен на ' + res.priority, 'ADD MODE', res);
      this.getWishes(this.apiUrl);
    });
  }

  // Показать окно включения/выключения фильтров
  filterWishes() {
    if (!this.filterMode) {
      this.isFilterModal = true;
    } else {
      this.getWishes(this.apiUrl);
      this.filterMode = false;
      this.filterButtonText = 'ПОИСК/ФИЛЬТР';
    }
  }

// ЛОГИН и АВТОРИЗАЦИЯ
  login(login: string, pwd: string) {

    const body = new HttpParams()
      .set('username', login)
      .set('password', pwd);

    this.httpService.login(body.toString())
      .pipe(
        tap(resp => {
          console.log('header', resp.headers.get('Authorization'));
          sessionStorage.setItem('token', resp.headers.get('Authorization'));
          localStorage.setItem('token', resp.headers.get('Authorization'));
          console.log('storage', localStorage.getItem('token'));
        }))
      .subscribe();
  }

  /**
   * Поиск желаний. Действие после нажатие кнопки Найти в модальном окне.
   */
  applyFilter() {
    this.filterMode = true; // включаем filtermode
    this.filterButtonText = 'ВЫКЛЮЧИТЬ ФИЛЬТР';
    this.searchWishes();
  }

  /**
   * Закрыть модал добавления / изменения желания.
   */
  closeAddEditWish() {
    this.isEdit = null;
  }


  /**
   * Закрыть модал добавления зарплаты
   */
  closeSalaryModal() {
    this.isSalaryAdd = false;
  }

  /**
   * Закрыть модал поиска
   */
  closeSearchModal() {
    this.isFilterModal = null;
  }
}
