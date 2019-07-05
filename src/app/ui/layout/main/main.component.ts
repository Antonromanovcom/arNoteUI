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
  testData = '';
  isEdit = false;
  wishes: Wish[] = [];

  form = this.fb.group({
    id: ['', [
    ]],
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

  /*constructor(private httpService: HttpService, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }*/


 /* submit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }*/

  ngOnInit() {

    this.httpService.getData(this.localJson).subscribe(data => {
      this.wishes = data['userList'];
      this.wishes.sort((a, b) => a.priority - b.priority);
    });

    this.form.patchValue({
      name: '2212',
      description: '2212',
    });
  }

  up(event: any, item: Wish) {

    item.priority = item.priority + 1;

   /* if (item.priority > (this.findMax()).priority + 1) {
      item.priority = (this.findMax()).priority + 1;
    }*/

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

  test() {

    this.httpService.getData(this.testJson).subscribe(data => {
      console.log(data);
      this.testData = data[0];
    });


    this.httpService.getData(this.testJson).subscribe(data => {
      this.wishes = data['list'];
      console.log( this.wishes);
//      this.wishes.sort((a, b) => a.priority - b.priority);
    });
    this.isEdit = true;
  }


}
