import {Credit} from './Credit';
import {ConsolidatedPurchase} from './ConsolidatedPurchase';

export class FinPlan {
  month: string;
  year: number;
  credit1: number;
  credit2: number;
  credit3: number;
  credit4: number;
  credit5: number;
  credits: Credit[] = [];
  purchasePlan: ConsolidatedPurchase;
  remains: number;
}
