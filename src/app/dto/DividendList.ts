import {Dividend} from './Dividend';

export class DividendList {

  constructor(dividendList: Dividend[], divSum: number, percent: number) {
    this.dividendList = dividendList;
    this.divSum = divSum;
    this.percent = percent;
  }

  dividendList: Dividend[] = []; // контейнер дивидендов
  divSum: number; // сумма дивиденов за последний год
  percent: number; // процент

}
