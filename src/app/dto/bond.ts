import {DividendList} from './DividendList';
import {RelativeStockReturns} from './relativestockreturns';

export class Bond {

  constructor(id: number, ticker: string, description: string, dividends: DividendList, currentPrice: number) {
    this.id = id;
    this.ticker = ticker;
    this.description = description;
    this.dividends = dividends;
    this.currentPrice = currentPrice;
  }

  id: number;
  ticker: string;
  description: string;
  dividends: DividendList;
  currentPrice: number;
  minLot: number;
  finalPrice: number;
  delta: RelativeStockReturns;
  stockExchange: string;
  isBought: boolean;
}
