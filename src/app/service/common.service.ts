import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {MessageCode} from './message.code';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private error: MessageCode;

  private errorSubsciber: BehaviorSubject<MessageCode> = new BehaviorSubject<MessageCode>(this.error);
  error$: Observable<MessageCode> = this.errorSubsciber.asObservable();

  constructor() {
  }


  pushError(error: MessageCode) {
    console.log('Incoming Error: ' + error.messageType);
    this.errorSubsciber.next(error);
  }
}
