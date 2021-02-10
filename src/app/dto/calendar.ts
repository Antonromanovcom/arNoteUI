import {CalendarData} from './calendardata';

export class Calendar {

  constructor(monthEnglishName: string, monthRussianName: string, data: CalendarData[]) {
    this.monthEnglishName = monthEnglishName;
    this.monthRussianName = monthRussianName;
    this.data = data;
  }

  monthEnglishName: string;
  monthRussianName: string;
  data: CalendarData[] = [];
}
