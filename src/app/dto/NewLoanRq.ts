export class NewLoanRq {

  constructor(startAmount: number, fullPayPerMonth: number, realPayPerMonth: number, startDate: string, desc: string, slotNumber: number) {
    this.startAmount = startAmount;
    this.fullPayPerMonth = fullPayPerMonth;
    this.realPayPerMonth = realPayPerMonth;
    this.startDate = startDate;
    this.slotNumber = slotNumber;
    this.desc = desc;
  }

  startAmount: number;
  fullPayPerMonth: number;
  realPayPerMonth: number;
  startDate: string;
  desc: string;
  slotNumber: number;
}

