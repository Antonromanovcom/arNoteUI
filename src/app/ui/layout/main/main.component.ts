import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../service/http.service';
import {Wish} from '../../../dto/wish';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {throwError, timer} from 'rxjs';
import {Subscription} from 'rxjs/Subscription';
import {catchError, tap} from 'rxjs/operators';
import {Salary} from '../../../dto/salary';
import {HttpParams} from '@angular/common/http';
import {CommonService} from '../../../service/common.service';
import {MessageCode} from '../../../service/message.code';
import {WishListGroup} from '../../../dto/wish-list-group';
import {WishGroupItem} from '../../../dto/wish-group-item';
import {environment} from '../../../../environments/environment';
import {DatePipe} from '@angular/common';

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
  _myBaseUrl = 'http://localhost:8080/rest/wishes';

  apiUrl = this.myBaseUrl + '/all'; // все желания // основная ссылка на api
  priorityWishesUrl = this.myBaseUrl + '/priority'; // приоритетные желания
  groupWishesUrl = this.myBaseUrl + '/groups';
  userViewModeUrl = this.myBaseUrl + '/users/toggle';
  allWishesUrl = this.myBaseUrl + '/all'; // все желания
  apiGetSumm = this.myBaseUrl + '/summ'; // ссылка для получения сумм
  apiSalary = this.myBaseUrl + '/salary'; // ссылка для получения сумм
  parseUrl = this.myBaseUrl + '/parsecsv'; // url для парсинга csv
  changePriorityUrl = this.myBaseUrl + '/changepriority'; // url для быстрого изменения приоритета
  changePriorityMonthUrl = this.myBaseUrl + '/changemonth'; // url для быстрого изменения приоритета
  changePriorityMonthManualyUrl = this.myBaseUrl + '/transferwish'; // url для быстрого изменения приоритета


  // --------------------------------- ПЕРЕМЕННЫЕ -------------------------------------

  cryptokey = ''; // пользовательский ключ шифрования
  error: any; // отображение ошибок в алертах
  result: any; // отображение результатов в алертах
  summAll = 0; // отображение сум по всем желаниям
  summPriority = 0; // отображение сум по приоритетным желаниям
  periodAll = 0; // период реализации для всего
  periodPriority = 0; // период реализации для приоритетного
  implementationPeriod = ''; // средний период реализации желаний
  filterMode = false; // период реализации для приоритетного
  filterButtonText = 'ПОИСК/ФИЛЬТР'; // период реализации для приоритетного
  monthOrdermode = false; // режим отображение дерева группировки по месяцам
  isSalaryExists = false;
  curDateFormated = '';

// --------------------------------- ВКЛЮЧЕНИЕ МОДАЛОВ -------------------------------------

  isEdit = false; // режим редактирования для отображения / или чтобы спрятать модальное окно
  isSalaryAdd = false; // режим добавления зп
  isEditMode = false; // редактировать или добавить
  isCsvParse = false; // отправить на парсинг csv
  isFilterModal = false; // вывести модал фильтрации
  isMonthGroupModeWishEdit = false; // вывод формы редактирования желания при помесячной группировке

  // --------------------------------- ХРАНИЛИЩА -------------------------------------

  wishes: Wish[] = []; // контейнер желаний
  wishGroups: WishListGroup[] = []; // контейнер желаний
  monthList = []; // контейнер месяцов

  filters = ['Все', 'Приоритет', 'Помесячная группировка']; // фильтры
  groupMonthSort = ['По имени', 'По сумме [1..10]', 'По сумме [10..1]']; // сортировка помесячной группировки
  mainSort = ['По имени', 'По сумме [1..10]', 'По сумме [10..1]', 'По приоритету']; // сортировка помесячной группировки

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

  MonthGroupModeWishEdit = this.fb.group({ // форма редактирования желания при помесячной группировке
    id: ['', [
      Validators.required
    ]],
    wish: ['', [
      Validators.required
    ]],
    month: ['', [
      Validators.required
    ]]
  });

  constructor(private commonService: CommonService, private httpService: HttpService, private fb: FormBuilder, private datePipe: DatePipe) {
    this.curDateFormated = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  }

  ngOnInit() {
    this.isUserCrypto = false;
    this.getWishes(this.apiUrl);
    this.uploadForm = this.fb.group({
      profile: ['']
    });

    this.getUserViewMode();

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

    console.log('this.isSalaryExists - > ', this.isSalaryExists);

    if (this.isSalaryExists) {
      this.filters = ['Все', 'Приоритет', 'Помесячная группировка']; // фильтры
    } else {
      this.filters = ['Все', 'Приоритет']; // фильтры
    }

    // Проверка ключа шифрования
    this.cryptokey = localStorage.getItem('cryptokey');
    if ((this.isUserCrypto) && (!this.cryptokey)) {

      this.error = 'Мы не смогли забрать с куки ваш ключ шифрования и при этом у вас включена эта настройка. ' +
        'Задайте ключ шифрования меню О пользователе';

      timer(4000).subscribe(() => {
        this.error = null;
      });
    }
  }

  getUserViewMode() {

    this.httpService.getData(this.userViewModeUrl + '/GET').pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить настройки пользовательского отображения!');
      })
    ).subscribe(data => {
      console.log('data.viewMode => ' + data.viewMode);
      if (data.viewMode === 'TREE') {
        this.monthOrdermode = true;
        this.getWishesWithMonthGroupping('?sortType=all');
      } else {
        this.monthOrdermode = false;
      }

    });
  }

  setUserViewMode(mode: string) {

    this.httpService.getData(this.userViewModeUrl + '/' + mode).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить настройки пользовательского отображения!');
      })
    ).subscribe(data => {
      console.log('data.viewMode => ' + data.viewMode);
      /*if (data.viewMode === 'TREE') {
        this.monthOrdermode = true;
      } else {
        this.monthOrdermode = false;
      }*/
    });
  }


  getWishesWithMonthGroupping(sorting: string) {

    this.httpService.getData(this.groupWishesUrl + sorting).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить желания!');
      })
    ).subscribe(data => {

      this.wishGroups = data['list'];
      this.monthOrdermode = true;

      this.isCrypto();

      if (this.isUserCrypto) {
        console.log('decrypt-mode');
        this.decryptOrderedWishes();
      }
    });
  }

// Вытащить список месяцев и лет, пришедший с бека
  getMonths() {
    this.wishGroups.forEach((element) => {
      this.monthList.push(element.monthName + ' ' + element.year);
    });
  }

  // Применить изменение (месячного) порядка для желания
  applyMonthChange4Wish() {
    console.log(this.MonthGroupModeWishEdit.value.month);

    this.httpService.getData(this.changePriorityMonthManualyUrl + '?id=' + this.MonthGroupModeWishEdit.value.id + '&month=' + this.MonthGroupModeWishEdit.value.month).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно изменить приоритет!');
      })
    ).subscribe(res => {
      console.log(res);
      this.showAlert('Приоритет успешно изменен! ', 'ADD MODE', res);

      this.getWishes(this.apiUrl);
      this.getWishesWithMonthGroupping('?sortType=all');
      this.isMonthGroupModeWishEdit = false;

    });
  }

  // Редактирование желания при помесячной группировке
  editMonthGroupItem(items: WishGroupItem) {
    this.getMonths();
    console.log(items.wish);
    this.isMonthGroupModeWishEdit = true;
    this.MonthGroupModeWishEdit.patchValue({
      id: items.id,
      wish: items.wish
    });
  }


  // Изменить сортировку помесячной группировки
  sortGroupList(item: string) {

    //  if (this.isUserCrypto) {
    if (item === 'По имени') {
      this.wishGroups.forEach((element) => {
        element.wishList.sort((a, b): number => {
          if (a.wish < b.wish) return -1;
          if (a.wish > b.wish) return 1;
          return 0;
        });
      });
    } else if (item === 'По сумме [1..10]') {
      this.wishGroups.forEach((element) => {
        element.wishList.sort((a, b): number => {
          if (a.price < b.price) return -1;
          if (a.price > b.price) return 1;
          return 0;
        });
      });
    } else {
      this.wishGroups.forEach((element) => {
        element.wishList.sort((a, b): number => {
          return b.price - a.price;
        });
      });
    }
  }

  // Изменить сортировку основной таблицы
  sortMainList(item: string) {

    if (item === 'По имени') {
      this.wishes.sort((a, b): number => {
        if (a.wish < b.wish) return -1;
        if (a.wish > b.wish) return 1;
        return 0;
      });

    } else if (item === 'По сумме [1..10]') {

      this.wishes.sort((a, b): number => {
        if (a.price < b.price) return -1;
        if (a.price > b.price) return 1;
        return 0;
      });
    } else if (item === 'По приоритету') {
      this.wishes.sort((a, b): number => {
        if (a.priority < b.priority) return -1;
        if (a.priority > b.priority) return 1;
        return 0;
      });
    } else {
      this.wishes.sort((a, b): number => {
        return b.price - a.price;
      });
    }
  }

  changeFilter(item: string) {

    if (item === 'Все') {
      this.apiUrl = this.allWishesUrl;
    } else if (item === 'Помесячная группировка') {

      this.getWishesWithMonthGroupping('?sortType=all');
      this.setUserViewMode('TREE');

    } else {
      this.apiUrl = this.priorityWishesUrl;
    }
    this.getWishes(this.apiUrl);
  }

  up(event: any, item: Wish) {
    item.priority = item.priority + 1;
    this.wishes.sort((a, b) => a.priority - b.priority);
  }


  down(event: any, item: Wish) {

    item.priority = item.priority - 1;
    if (item.priority < 1) {
      item.priority = 1;
    }
    this.wishes.sort((a, b) => a.priority - b.priority);
  }


  isCrypto() {

    this.httpService.isCryptoUser().pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить крипто-статус пользователя!');
      })
    ).subscribe(data => {
      this.isUserCrypto = data.userCryptoMode;
      this.userRole = data.userRole;


      console.log('crypto -> ' + data.userCryptoMode);
      console.log('userRole -> ' + data.userRole);
    });
  }


  decryptWishes() {
    console.log('decrypt method');
    this.wishes.forEach((element) => {
      element.wish = this.commonService.convertText('decr', element.wish, this.cryptokey);
      element.description = this.commonService.convertText('decr', element.description, this.cryptokey);
      element.url = this.commonService.convertText('decr', element.url, this.cryptokey);
    });
  }

  decryptOrderedWishes() {
    console.log('decrypt method for ordered wishes');
    this.wishGroups.forEach((month) => {
      month.wishList.forEach((element) => {
        console.log('element.wish', element.wish);
        // console.log('this.cryptokey', this.cryptokey);
        console.log('test', this.commonService.convertText('decr', element.wish, this.cryptokey));
        element.wish = this.commonService.convertText('decr', element.wish, this.cryptokey);
      });
    });
  }


  getWishes(url: string) {

    this.isCrypto();

    this.httpService.getData(url).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить желания!');
      })
    ).subscribe(data => {
      this.wishes = data['list'];
      console.log(this.wishes);
      if (this.isUserCrypto) {
        console.log('decrypt-mode');
        this.decryptWishes();
      }
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

      this.isSalaryExists = true;
      this.filters = ['Все', 'Приоритет', 'Помесячная группировка'];
      console.log('Sal: ' + data.lastSalary);
    });
  }

  deleteWish() {
    this.httpService.deleteWish(this.form.value.id, this.myBaseUrl).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно удалить желание!');
      })
    )
      .subscribe(res => {
        this.showAlert('Желание с id [' + this.form.value.id + '] успешно удалено!', 'ADD MODE', res);
      });
  }

  toMainTableMode() {

    this.monthOrdermode = false;
    this.setUserViewMode('TABLE');

  }

  errorHandler(err, message: string) {
    this.isEdit = false;
    this.isSalaryAdd = false;
    console.log('error - ' + err.error);
    if (err.error === 'ERR-01') {
      this.error = 'У вас нет сохраненных зарплат! Невозможно посчитать сроки реализации! Добавьте хотя бы одну зарплату!';
      this.isSalaryExists = false;
      this.filters = ['Все', 'Приоритет'];
    } else if (err.error === 'ERR-02') {
      this.error = 'У вас нет сохраненных желаний! Добавьте хотя бы одно желание!';
      this.isSalaryExists = false;
      this.filters = ['Все', 'Приоритет'];
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


    // Если это юзер с шифрованием на фронте и при этом у него не задан ключ
    if ((!this.cryptokey) && (this.isUserCrypto)) {

      this.error = 'Задайте ключ шифрование в меню О пользователе. ' +
        'Без этого при включенном режиме шифрования пользовательских данных мы не можем добавить желание!';
      timer(4000).subscribe(() => {
        this.error = null;
      });
    } else {

      if (isedit === 1) {
        this.isEdit = true;
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
        this.isEdit = true;
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
    reader.readAsArrayBuffer(file)
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
    console.log(mode);
    console.log(result);

    this.isEdit = false;
    this.isSalaryAdd = false;
    this.isCsvParse = false;
    this.result = text;
    timer(4000).subscribe(() => {
      this.result = null;
    });
  }

  addSalary() {
    const salary = new Salary(this.salaryForm.value.salary,
      this.salaryForm.value.residualSalary);

    console.log(salary);

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


  changePriorityMonth(item: WishGroupItem, move: string) {

    console.log('URL ->' + this.changePriorityMonthUrl + '/' + item.id + '/' + move);
    this.httpService.getData(this.changePriorityMonthUrl + '/' + item.id + '/' + move).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно изменить приоритет!');
      })
    ).subscribe(res => {
      console.log(res);
      this.showAlert('Приоритет успешно изменен! ', 'ADD MODE', res);

      this.getWishes(this.apiUrl);
      this.getWishesWithMonthGroupping('?sortType=all');

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

  applyFilter() {

    this.isFilterModal = false;
    this.filterMode = true; // включаем filtermode
    this.filterButtonText = 'ВЫКЛЮЧИТЬ ФИЛЬТР'; // период реализации для приоритетного

    this.wishes = this.wishes.filter(
      wish => wish.wish.toLowerCase().includes(this.filterForm.value.wish.toLowerCase()));


    /* const wish = new Wish(1, this.filterForm.value.wish, 0, 1, false, '', '');

     if (this.isUserCrypto) {
       wish.wish = this.commonService.convertText('encrypt', wish.wish, this.cryptokey);
       console.log('encrypted wish', wish.wish);
     }


     this.httpService.sendData(wish, this.filterUrl).pipe(
       catchError(err => {
         return this.errorHandler(err, 'Невозможно осуществить фильтрацию!');
       })
     ).subscribe(hero => {
       console.log('hero', hero);
       this.wishes = hero['list'];

       this.showAlert('Фильтр по желаниям активен!', 'ADD MODE', hero);
     });*/

  }
}
