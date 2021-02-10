export class Dividend {

  constructor(currencyId: string, value: number, registryCloseDate: number) {
    this.currencyId = currencyId;
    this.value = value;
    this.registryCloseDate = registryCloseDate;
  }

  currencyId: string;
  value: number;
  registryCloseDate: number;
}
