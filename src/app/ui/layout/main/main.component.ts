import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../service/http.service';
import {Wish} from '../../../dto/wish';
import {FormBuilder, Validators} from '@angular/forms';
import {throwError, timer} from 'rxjs';
import {catchError} from 'rxjs/operators';


@Component({
  selector: 'app-main',
  templateUrl: 'main.component.html',
  providers: [HttpService],
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  localJson = 'assets/data.json';
  _apiUrl = 'http://localhost:8080/rest/wishes';
  apiUrl = '/rest/wishes';
  apiGetSumm = '/rest/wishes/summ';
  _apiGetSumm = 'http://localhost:8080/rest/wishes/summ';
  error: any;
  result: any;


  summAll = 0;
  summPriority = 0;
  isEdit = false;
  isEditMode = false;
  wishes: Wish[] = [];

  form = this.fb.group({
    id: ['', []],
    name: ['', [
      Validators.required,
      Validators.maxLength(160),
    ]],
    description: ['', [
      //   Validators.required,
      //   Validators.maxLength(1024),
    ]],
    url: ['', [
      // Validators.required,
      // Validators.maxLength(1024),
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


  constructor(private httpService: HttpService, private fb: FormBuilder) {
  }


  ngOnInit() {
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
    });
  }

  deleteWish() {
    this.httpService.deleteWish(this.form.value.id, this.apiUrl).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно удалить желание!');
      })
    )
      .subscribe(res => {
        // console.log(res);
        // this.isEdit = false;
        this.showAlert('Желание с id [' + this.form.value.id + '] успешно удалено!', 'ADD MODE', res);
      });
  }


  errorHandler(err, message: string) {
    this.isEdit = false;
    this.error = message;
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

  showAlert(text: string, mode: string, result: any) {
    console.log(mode);
    console.log(result);

    this.isEdit = false;
    this.result = text;
    timer(4000).subscribe(() => {
      this.result = null;
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

      this.httpService.updateWish(wish, this.apiUrl).pipe(
        catchError(err => {
          return this.errorHandler(err, 'Невозможно обновить желание!');
        })
      ).subscribe(hero => {
          // console.log(hero);
          // this.isEdit = false;
        this.showAlert('Желание с id [' + wish.id + '] успешно обновлено!', 'ADD MODE', hero);
        });

    } else {
      this.httpService.sendData(wish, this.apiUrl).pipe(
       catchError(err => {

         /*this.isEdit = false;
         this.error = 'Невозможно добавить желание!';
         console.log(err);
         timer(4000).subscribe(() => {
           this.error = null;
         });*/

         return this.errorHandler(err, 'Невозможно добавить желание!');
       })
    ).subscribe(hero => {

        this.showAlert('Желание успешно добавлено!', 'ADD MODE', hero);

        /*console.log('ADD MODE');
        console.log(hero);

        this.isEdit = false;
        this.result = 'Желание с id [' + wish.id + '] успешно добавлено!';
        timer(4000).subscribe(() => {
          this.result = null;
        });*/
      });
    }
  }
}
