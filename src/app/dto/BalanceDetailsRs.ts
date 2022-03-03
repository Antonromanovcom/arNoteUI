import {CurrentIncomeDetailRs} from './CurrentIncomeDetailRs';

export class BalanceDetailsRs {
  balance: number;
  previousIncome: number;
  previousExpense: number;
  monthlySpending: number;
  loanPayments: number;
  currentIncome: number;
  date: string;
  dateInDateFormat: string;
  freeze: boolean;
  currentIncomeDetail: CurrentIncomeDetailRs;
  emptyCalculations: boolean;
}
