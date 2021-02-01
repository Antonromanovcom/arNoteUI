import {DividendList} from './DividendList';
import {RelativeStockReturns} from './relativestockreturns';

export class Bond {

  constructor(id: number, ticker: string, type: string, description: string, dividends: DividendList, currentPrice: number,
              minLot: number, finalPrice: number, delta: RelativeStockReturns, stockExchange: string,
              isBought: boolean, totalPercent: number) {
    this.id = id;
    this.ticker = ticker;
    this.type = type;
    this.description = description;
    this.dividends = dividends;
    this.currentPrice = currentPrice;
    this.minLot = minLot;
    this.finalPrice = finalPrice;
    this.delta = delta;
    this.stockExchange = stockExchange;
    this.isBought = isBought;
    this.totalPercent = totalPercent;
  }

  id: number;
  ticker: string;
  type: string;
  description: string;
  dividends: DividendList;
  currentPrice: number;
  minLot: number;
  finalPrice: number;
  delta: RelativeStockReturns;
  stockExchange: string;
  isBought: boolean;
  totalPercent: number;
}
