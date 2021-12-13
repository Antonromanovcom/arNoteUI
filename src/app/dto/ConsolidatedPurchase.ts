import {Goal} from './Goal';

export class ConsolidatedPurchase {
  longDescription: string;
  shortDescription: string;
  price: number;
  purchasePlan: Goal[] = [];
}
