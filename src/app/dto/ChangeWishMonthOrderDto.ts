export class ChangeWishMonthOrderDto {

  constructor(id: number) {
    this.id = id;
  }

  id: number;
  private month: string;
  private step: string;

  setStep(step: any) {
    this.step = step;
  }

  setMonth(month: any) {
    this.month = month;
  }
}
