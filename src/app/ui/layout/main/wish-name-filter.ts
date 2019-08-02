import {Wish} from '../../../dto/wish';
import {ClrDatagridStringFilterInterface} from '@clr/angular';

export class WishNameFilter implements ClrDatagridStringFilterInterface<Wish> {
  accepts(user: Wish, search: string):boolean {
    return "" + user.wish == search;
  }

}
