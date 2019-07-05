import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../service/http.service';
import {Wish} from '../../../dto/wish';
import {FormBuilder, Validators} from '@angular/forms';
import {catchError} from 'rxjs/operators';
import {BehaviorSubject, throwError, timer} from 'rxjs';


@Component({
  selector: 'app-main',
  templateUrl: 'main.component.html',
  providers: [HttpService],
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  localJson = 'assets/data.json';
  testJson = 'http://localhost:8080/rest/users/testrefs';
  updateWish = 'http://localhost:8080/rest/users/update';
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

    this.httpService.getData(this.testJson).subscribe(data => {
      this.wishes = data['list'];
      console.log(this.wishes);
    });


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

  openEditWish(event: any, item: Wish) {

    /* this.httpService.getData(this.testJson).subscribe(data => {
       console.log(data);
       this.testData = data[0];
     });*/


    /* this.httpService.getData(this.testJson).subscribe(data => {
       this.wishes = data['list'];
       console.log( this.wishes);
     });*/
    this.isEdit = true;

    this.form.patchValue({
      id: item.id,
      name: item.wish,
      description: item.description,
      url: item.url,
      priority: item.priority,
      price: item.price,
    });

  }

  addEditService() {

    const w = {
      id: this.form.value.id,
      name: this.form.value.name,
      description: this.form.value.description,
      url: this.form.value.url,
      priority: this.form.value.priority,
      price: this.form.value.price,
    };


    const wish = new Wish(this.form.value.id,
      this.form.value.name,
      this.form.value.price,
      this.form.value.priority,
      false,
      this.form.value.description,
      this.form.value.url);


    this.httpService.updateWish(wish, this.updateWish)
      .subscribe(hero => console.log(hero));


//    if (!this.isEditMode) {
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


}
