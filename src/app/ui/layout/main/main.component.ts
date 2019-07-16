import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../service/http.service';
import {Wish} from '../../../dto/wish';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {throwError, timer} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Salary} from '../../../dto/salary';


@Component({
  selector: 'app-main',
  templateUrl: 'main.component.html',
  providers: [HttpService],
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  // --------------------------------- ПЕРЕМЕННЫЕ -------------------------------------

  localJson = 'assets/data.json'; // временный локальный json для тестирования
  apiUrl = 'http://localhost:8080/rest/wishes/all'; // основная ссылка на api
  //_myBaseUrl = '/rest/wishes';
  myBaseUrl = 'http://localhost:8080/rest/wishes';
  _apiUrl = this.myBaseUrl + '/all'; // все желания // основная ссылка на api

  _priorityWishesUrl = this.myBaseUrl + '/priority'; // приоритетные желания
  priorityWishesUrl = 'http://localhost:8080/rest/wishes/priority'; // приоритетные желания

  _allWishesUrl = this.myBaseUrl + '/all'; // все желания
  allWishesUrl = 'http://localhost:8080/rest/wishes/all'; // все желания

  apiGetSumm = this.myBaseUrl + '/summ'; // ссылка для получения сумм
  _apiGetSumm = 'http://localhost:8080/rest/wishes/summ'; // ссылка для получения сумм
  apiSalary = this.myBaseUrl + '/salary'; // ссылка для получения сумм

  error: any; // отображение ошибок
  result: any; // отображение результатов в алертах
  summAll = 0; // отображение сум по всем желаниям
  summPriority = 0; // отображение сум по приоритетным желаниям
  periodAll = 0; // период реализации для всего
  periodPriority = 0; // период реализации для приоритетного

  isEdit = false; // режим редактирования для отображения / или чтобы спрятать модальное окно
  isSalaryAdd = false; // режим добавления зп
  isEditMode = false; // редактировать или добавить
  isCsvParse = false; // отправить на парсинг csv
  wishes: Wish[] = []; // контейнер желаний
  filters = ['Все', 'Приоритет']; // фильтры
  uploadForm: FormGroup;


  form = this.fb.group({
    id: ['', []],
    name: ['', [
      Validators.required,
      Validators.maxLength(160),
    ]],
    description: ['', [

    ]],
    url: ['', [

    ]],
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
    csvfile: ['', [
     /* Validators.required,
      Validators.pattern(/^[0-9]+$/)*/
    ]]
  });

  constructor(private httpService: HttpService, private fb: FormBuilder) {
  }


  ngOnInit() {
    this.getWishes();

    this.uploadForm = this.fb.group({
      profile: ['']
    });
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

  findMax() {
    return this.wishes.reduce((a, b) => a.priority > b.priority ? a : b);
  }

  down(event: any, item: Wish) {

    item.priority = item.priority - 1;
    if (item.priority < 1) {
      item.priority = 1;
    }
    this.wishes.sort((a, b) => a.priority - b.priority);
  }

  getWishes() {
    console.log(this.apiUrl);
    this.httpService.getData(this.apiUrl).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить желания!');
      })
    ).subscribe(data => {
      this.wishes = data['list'];
      console.log(this.wishes);
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
    this.error = message;
    console.log(err);
    timer(4000).subscribe(() => {
      this.error = null;
    });

    return throwError(err);
  }

  /**
   * Редактировать желание (или удалить).
   *
   * @param event
   * @param {Wish} item
   * @param {number} isedit
   */
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

  onSubmit() {
    const formData = new FormData();
    formData.append('csvfile', this.uploadForm.get('profile').value);
    console.log(this.uploadForm.get('profile').value);
    this.httpService.sendFile(formData, '/testxlsx').subscribe(hero => {

      console.log(hero);
    });

  }


  openParseCsv(event: any) {

      this.isCsvParse = true;


     /* this.form.patchValue({
        id: item.id,
        name: item.wish,
        description: item.description,
        url: item.url,
        priority: item.priority,
        price: item.price,
      });*/
  }





  sendCsvFile() {

    let reader = new FileReader();
    //if (event.target.files && event.target.files.length > 0) {
    // let file = event.target.files[0];
    let file = this.csvForm.value.csvfile;
    //reader.readAsDataURL(file);
    reader.readAsArrayBuffer(file)
    console.log(file.name);
    /*reader.onload = () => {
      this.form.get('avatar').setValue({
        filename: file.name,
        filetype: file.type,
        value: reader.result.split(',')[1]
      })*/
    // };
   //   }

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

  addEditService() {

    const wish = new Wish(this.form.value.id,
      this.form.value.name,
      this.form.value.price,
      this.form.value.priority,
      false,
      this.form.value.description,
      this.form.value.url);

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
}
