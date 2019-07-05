import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../service/http.service';
import {Wish} from '../../../dto/wish';
import {FormBuilder, Validators} from '@angular/forms';


@Component({
  selector: 'app-main',
  templateUrl: 'main.component.html',
  providers: [HttpService],
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  localJson = 'assets/data.json';
  apiUrl = 'http://localhost:8080/rest/wishes';
  // updateWish = 'http://localhost:8080/rest/users/update';
  testData = '';
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
      Validators.required,
      Validators.maxLength(1024),
    ]],
    url: ['', [
      Validators.required,
      Validators.pattern(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/),
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

    /* this.httpService.getData(this.localJson).subscribe(data => {
       this.wishes = data['userList'];
       this.wishes.sort((a, b) => a.priority - b.priority);
     });*/

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
    this.httpService.getData(this.apiUrl).subscribe(data => {
      this.wishes = data['list'];
      console.log(this.wishes);
    });
  }

  openEditWish(event: any, item: Wish, isedit: number) {

    /* this.httpService.getData(this.testJson).subscribe(data => {
       console.log(data);
       this.testData = data[0];
     });*/


    /* this.httpService.getData(this.testJson).subscribe(data => {
       this.wishes = data['list'];
       console.log( this.wishes);
     });*/

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

  addEditService() {

    const wish = new Wish(this.form.value.id,
      this.form.value.name,
      this.form.value.price,
      this.form.value.priority,
      false,
      this.form.value.description,
      this.form.value.url);

    // todo: обрабатывать ошибки

    if (this.isEditMode) {

      this.httpService.updateWish(wish, this.apiUrl)
        .subscribe(hero => {
          console.log(hero);
          this.isEdit = false;
        });

    } else {
      this.httpService.sendData(wish, this.apiUrl)
        .subscribe(hero => {

          console.log('ADD MODE');
          console.log(hero);

          this.isEdit = false;
        });
    }


    //   this.producersService.addTransaction(params).subscribe(() => {
    //    this.isEdit = false;
    //     this.getTransactions();
    //    });
    //  } else {
    //   this.producersService.updateTransaction(params).subscribe(() => {
    //  this.isEdit = false;
    //    this.getTransactions();
    //    });
    // }
  }

  tempAdd() {

    const wish = new Wish(this.form.value.id,
      this.form.value.name,
      this.form.value.price,
      this.form.value.priority,
      false,
      this.form.value.description,
      this.form.value.url);

    // todo: определять добавление или редактировани
    // todo: обрабатывать ошибки

    /*this.httpService.sendData(wish, this.updateWish)
      .subscribe(hero => console.log(hero));*/
  }


}
