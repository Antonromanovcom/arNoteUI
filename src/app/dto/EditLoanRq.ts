export class EditLoanRq {

  constructor(id: number, desc: string, startAmount: number, fullPayPerMonth: number, realPayPerMonth: number, startDate: string, slotNumber: number) {
    this.id = id;
    this.desc = desc;
    this.startAmount = startAmount;
    this.fullPayPerMonth = fullPayPerMonth;
    this.realPayPerMonth = realPayPerMonth;
    this.startDate = startDate;
    this.slotNumber = slotNumber;
  }

  id: number;
  desc: string;
  startAmount: number;
  fullPayPerMonth: number;
  realPayPerMonth: number;
  startDate: string;
  slotNumber: number;
}

