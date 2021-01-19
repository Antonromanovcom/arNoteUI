export class RelativeStockReturns {

  constructor(deltaInRubles: number, tinkoffDelta: number, percent: number, deltaPeriod: number) {
    this.deltaInRubles = deltaInRubles;
    this.tinkoffDelta = tinkoffDelta;
    this.percent = percent;
    this.deltaPeriod = deltaPeriod;
  }

  deltaInRubles: number;
  tinkoffDelta: number;
  percent: number;
  deltaPeriod: number;
}
