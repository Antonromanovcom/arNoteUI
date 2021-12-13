export class NewLoanRq {

  constructor(startAmount: number, fullPayPerMonth: number, realPayPerMonth: number, startDate: string) {
    this.startAmount = startAmount;
    this.fullPayPerMonth = fullPayPerMonth;
    this.realPayPerMonth = realPayPerMonth;
    this.startDate = startDate;
  }

  startAmount: number;
  fullPayPerMonth: number;
  realPayPerMonth: number;
  startDate: string;
}

