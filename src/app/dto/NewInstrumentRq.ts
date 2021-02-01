
export class NewInstrumentRq {


  constructor(ticker: string, isPlan: boolean, bondType: string, price: number, lot: number, purchaseDate: string) {
    this.ticker = ticker;
    this.isPlan = isPlan;
    this.bondType = bondType;
    this.price = price;
    this.lot = lot;
    this.purchaseDate = purchaseDate;
  }

  ticker: string;
  isPlan: boolean;
  bondType: string;
  price: number;
  lot: number;
  purchaseDate: string;
}
