import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {MessageCode} from './message.code';
import * as CryptoJS from 'crypto-js';


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

  encrypt(keys, value) {
    const key = CryptoJS.enc.Utf8.parse(keys);
    const iv = CryptoJS.enc.Utf8.parse(keys);
    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

    return encrypted.toString();
  }


  convertText(conversion: string, what: string, key: string) {
    if (conversion === 'encrypt') {
      return CryptoJS.AES.encrypt(what.trim(), key.trim()).toString();
  } else {
      return CryptoJS.AES.decrypt(what.trim(), key.trim()).toString(CryptoJS.enc.Utf8);

    }
  }



}
