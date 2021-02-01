
export class CurrentPrice {

  constructor(currentPrice: number, ticker: string, currency: string, date: string, time: string, lastChange: number,
              lastChangePrcnt: number, minLot: number) {
    this.currentPrice = currentPrice;
    this.ticker = ticker;
    this.currency = currency;
    this.date = date;
    this.time = time;
    this.lastChange = lastChange;
    this.lastChangePrcnt = lastChangePrcnt;
    this.minLot = minLot;
  }

  currentPrice: number;
  ticker: string;
  currency: string;
  date: string;
  time: string;
  lastChange: number;
  lastChangePrcnt: number;
  minLot: number;
}
