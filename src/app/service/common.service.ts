import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {ErrorType} from '../error-handling/error.type';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private error: ErrorType;

  private errorSubsciber: BehaviorSubject<ErrorType> = new BehaviorSubject<ErrorType>(this.error);
  error$: Observable<ErrorType> = this.errorSubsciber.asObservable();

  constructor() {
  }


  pushError(error: ErrorType) {
    console.log('Incoming Error: ' + error.errorType2);
    this.errorSubsciber.next(error);
  }
}
