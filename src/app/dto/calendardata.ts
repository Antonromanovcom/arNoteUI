
export class CalendarData {

  constructor(registryCloseDate: string, value: number, currencyId: string, ticker: string, type: string) {
    this.registryCloseDate = registryCloseDate;
    this.value = value;
    this.currencyId = currencyId;
    this.ticker = ticker;
    this.type = type;
  }

  registryCloseDate: string;
  value: number;
  currencyId: string;
  ticker: string;
  type: string;
}
