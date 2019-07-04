import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../service/http.service';
import {Wish} from '../../../dto/wish';
import {map} from 'rxjs/operators';


@Component({
  selector: 'app-main',
  templateUrl: 'main.component.html',
  providers: [HttpService],
  styleUrls:['./main.component.css']
})
export class MainComponent implements OnInit {

  localJson = 'assets/data.json';
  testJson = 'http://localhost:8080/rest/users/testrefs';
  testData = '';

  wishes: Wish[] = [];
  po: Array<number> = [1, 2, 3, 4, 5];

  constructor(private httpService: HttpService) {
  }

  ngOnInit() {

    this.httpService.getData(this.localJson).subscribe(data => {
      this.wishes = data['userList'];
      this.wishes.sort((a, b) => a.priority - b.priority);
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


  }
}
