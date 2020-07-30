import {WishGroupItem} from './wish-group-item';


export class WishListGroup {

  wishList: WishGroupItem[] = [];
  monthName: string;
  year: string;
  monthNumber: number;
  colspan: number;
  sum: number;
  overflow: boolean;
  colorClass: string;
  expanded: boolean;
  balance: number;
}
