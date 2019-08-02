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



@Component({
  selector: 'app-main',
  templateUrl: 'main.component.html',
  providers: [HttpService],
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  // --------------------------------- URL'ы -------------------------------------

  localJson = 'assets/data.json'; // временный локальный json для тестирования
  _apiUrl = 'http://localhost:8080/rest/wishes/all'; // основная ссылка на api
  _myBaseUrl = '/rest/wishes';
  myBaseUrl = 'http://localhost:8080/rest/wishes';
  apiUrl = this.myBaseUrl + '/all'; // все желания // основная ссылка на api
  priorityWishesUrl = this.myBaseUrl + '/priority'; // приоритетные желания
  _priorityWishesUrl = 'http://localhost:8080/rest/wishes/priority'; // приоритетные желания
  allWishesUrl = this.myBaseUrl + '/all'; // все желания
  _allWishesUrl = 'http://localhost:8080/rest/wishes/all'; // все желания
  apiGetSumm = this.myBaseUrl + '/summ'; // ссылка для получения сумм
  _apiGetSumm = 'http://localhost:8080/rest/wishes/summ'; // ссылка для получения сумм
  apiSalary = this.myBaseUrl + '/salary'; // ссылка для получения сумм
  parseUrl = this.myBaseUrl + '/parsecsv'; // url для парсинга csv
  changePriorityUrl = this.myBaseUrl + '/changepriority'; // url для быстрого изменения приоритета
  filterUrl = this.myBaseUrl + '/wishes?search=wish:Еще'


  // --------------------------------- ПЕРЕМЕННЫЕ -------------------------------------

  cryptokey = ''; // пользовательский ключ шифрования
  error: any; // отображение ошибок в алертах
  result: any; // отображение результатов в алертах
  summAll = 0; // отображение сум по всем желаниям
  summPriority = 0; // отображение сум по приоритетным желаниям
  periodAll = 0; // период реализации для всего
  periodPriority = 0; // период реализации для приоритетного

// --------------------------------- ВКЛЮЧЕНИЕ МОДАЛОВ -------------------------------------

  isEdit = false; // режим редактирования для отображения / или чтобы спрятать модальное окно
  isSalaryAdd = false; // режим добавления зп
  isEditMode = false; // редактировать или добавить
  isCsvParse = false; // отправить на парсинг csv
  isFilterModal = false; // вывести модал фильтрации

  wishes: Wish[] = []; // контейнер желаний
  filters = ['Все', 'Приоритет']; // фильтры

  // --------------------------------- ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ И ЕГО ДАННЫЕ -------------------------------------

  isUserCrypto: boolean;
  userRole: string;

  private subscription: Subscription;
  globalError: MessageCode;

  // --------------------------------- ФОРМЫ -------------------------------------
  uploadForm: FormGroup;
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
    ]]
  });

  salaryForm = this.fb.group({
    salary: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]+$/)
    ]],
    residualSalary: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]+$/)
    ]]
  });

  csvForm = this.fb.group({
    csvfile: ['', []]
  });

  filterForm = this.fb.group({
    wish: ['', [
      Validators.required
    ]]
  });

  constructor(private commonService: CommonService, private httpService: HttpService, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.isUserCrypto = false;

    this.getWishes();

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
          this.getWishes();
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

  changeFilter(item: string) {

    if (item === 'Все') {
      this.apiUrl = this.allWishesUrl;
    } else {
      this.apiUrl = this.priorityWishesUrl;
    }
    this.getWishes();
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

    /*this.wishes.forEach(function (element) {
      console.log('before decrypt' - element.wish);

      // element.wish = commonService.encrypt(this.cryptokey, element.wish);
      element.wish = this.temp(this.cryptokey, element.wish);

      console.log('after decrypt' - element.wish);
    });*/

    this.wishes.forEach((element) => {
       // element.wish = this.commonService.decrypt(this.cryptokey, element.wish);
      element.wish = this.commonService.convertText('decr', element.wish, this.cryptokey);

      // element.wish = this.temp(this.cryptokey, element.wish);
    });

  }

  temp(keys, value) {
return '144' + '45454';
  }

  // getWishes() {
  getWishes(url: string) {

    this.isCrypto();

    this.httpService.getData(this.apiUrl).pipe(
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

  errorHandler(err, message: string) {
    this.isEdit = false;
    this.isSalaryAdd = false;
    console.log('error - ' + err.error);
    if (err.error === 'ERR-01') {
      this.error = 'У вас нет сохраненных зарплат! Невозможно посчитать сроки реализации! Добавьте хотя бы одну зарплату!';
    } else if (err.error === 'ERR-02') {
      this.error = 'У вас нет сохраненных желаний! Добавьте хотя бы одно желание!';
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
    });

  }

  addEditWish() {

    const wish = new Wish(this.form.value.id,
      this.form.value.name,
      this.form.value.price,
      this.form.value.priority,
      false,
      this.form.value.description,
      this.form.value.url);

    if (this.isUserCrypto) {
      wish.wish = this.commonService.convertText('encrypt', wish.wish, this.cryptokey);
      console.log('encrypted wish', wish.wish);
    }

    if (this.isEditMode) {

      this.httpService.updateWish(wish, this.myBaseUrl).pipe(
        catchError(err => {
          return this.errorHandler(err, 'Невозможно обновить желание!');
        })
      ).subscribe(hero => {

        this.showAlert('Желание с id [' + wish.id + '] успешно обновлено!', 'ADD MODE', hero);
      });

    } else {

      this.httpService.sendData(wish, this.myBaseUrl).pipe(
        catchError(err => {


          return this.errorHandler(err, 'Невозможно добавить желание!');
        })
      ).subscribe(hero => {

        this.showAlert('Желание успешно добавлено!', 'ADD MODE', hero);
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
      this.showAlert('Приоритет успешно изменен на - ' + res.priority, 'ADD MODE', res);
      this.getWishes();
    });
  }

  // Показать окно включения/выключения фильтров
  filterWishes() {
    this.isFilterModal = true;
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

  /*logout() {
    console.log('unauthorize');
    localStorage.removeItem('token');
  }*/

  /*changeLogin(item: string) {

    if (item === 'Антон') {

      this.login('anton', '123');
    } else if (item === 'Женя') {
      this.login('eugene', '123');
    } else {
      this.login('nastya', '123');
    }

    this.getWishes();
  }*/

}
