
export class FoundInstrument {

  constructor(ticker: string, description: string, currencies: string, type: string, stockExchange: string) {
    this.ticker = ticker;
    this.description = description;
    this.currencies = currencies;
    this.type = type;
    this.stockExchange = stockExchange;
  }

  ticker: string;
  description: string;
  currencies: string;
  type: string;
  stockExchange: string;
}
