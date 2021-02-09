import {Targets} from './targets';


export class Returns {

  constructor(invested: number, bondsReturns: number, sharesReturns: number, sharesDelta: number, sum: number, targets: Targets) {
    this.invested = invested;
    this.bondsReturns = bondsReturns;
    this.sharesReturns = sharesReturns;
    this.sharesDelta = sharesDelta;
    this.sum = sum;
    this.targets = targets;
  }

  invested: number;
  bondsReturns: number;
  sharesReturns: number;
  sharesDelta: number;
  sum: number;
  targets: Targets;
}
