import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {Wish} from '../dto/wish';
import {ErrorType} from '../error-handling/error.type';


@Injectable({
  providedIn: 'root'
})
//  @Injectable()
export class CommonService {



  // private notify = new Subject<any>();
  // private loggedIn: boolean = null;

  private myNumberValue = 0;
  private isOddValue = false;
  private error: ErrorType;


  private myNumber: BehaviorSubject<number> = new BehaviorSubject<number>(this.myNumberValue);
  myNumber$: Observable<number> = this.myNumber.asObservable();
  private isOdd: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isOdd$: Observable<boolean> = this.isOdd.asObservable();

  // private goals = new BehaviorSubject<any>(['The initial goal', 'Another silly life goal']);
  // goal = this.goals.asObservable();
  // filters = ['Все', 'Приоритет']; // фильтры
  // heroes: Wish[];


  constructor() {
  }

  increaseNumber() {
    this.myNumberValue = this.myNumberValue + 1;
    this.myNumber.next(this.myNumberValue);
    this.isOddValue = !this.isOddValue;
    this.isOdd.next(this.isOddValue);
  }


 /* notifyObservable$ = this.notify.asObservable();

  public notifyOther(data: any) {
    console.log('!!!!!!!!!!!!!!!!' + data);
    if (data) {
      this.notify.next(data);
    }
  }*/


  changeGoal(goal) {
    console.log('cs: ' + goal);
    // this.filters.push('12222');

    // this.goals.next(goal);
    this.increaseNumber();

    // console.log('cs2: ' + this.filters);
    // this.goals.next(this.filters);
    // this.filters.next(this.filters);
    //
  }


  // getGoals(): Observable<string[]> {
  //   return of(this.filters);
  // }


}
