export class GetDetailedBalanceRq {

  constructor(month: number, year: number) {
    this.month = month;
    this.year = year;
  }

  month: number;
  year: number;
}

