import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../../service/http.service';
import {Wish} from '../../../dto/wish';
import {FormBuilder, Validators} from '@angular/forms';
import {Subject, throwError, timer} from 'rxjs';
import {Subscription} from 'rxjs/Subscription';
import {CommonService} from '../../../service/common.service';
import {MessageCode} from '../../../service/message.code';
import {WishListGroup} from '../../../dto/wish-list-group';
import {environment} from '../../../../environments/environment';
import {DatePipe} from '@angular/common';
import {catchError} from 'rxjs/operators';
import {WishGroupItem} from '../../../dto/wish-group-item';

@Component({
  selector: 'app-months',
  templateUrl: 'monthgrouping.component.html',
  providers: [HttpService, DatePipe],
  styleUrls: ['./monthgrouping.component.css']
})
export class MonthsComponent implements OnInit {

  // --------------------------------- URL'ы -------------------------------------

  SERVER_URL: string = environment.serverUrl;
  myBaseUrl = this.SERVER_URL + '/rest/wishes';
  apiUrl = this.myBaseUrl; // все желания // основная ссылка на api
  priorityWishesFilterUrl = this.myBaseUrl + '?filter=PRIOR'; // приоритетные желания
  allWishesFilterUrl = this.myBaseUrl + '?filter=ALL'; // все желания
  clearWishesFilterUrl = this.myBaseUrl + '?filter=NONE'; // очистить фильтр желаний
  sortWishesByNameUrl = this.myBaseUrl + '?sort=NAME'; // очистить фильтр желаний
  sortWishesByPriceAscUrl = this.myBaseUrl + '?sort=PRICE_ASC'; // очистить фильтр желаний
  sortWishesByPriceDescUrl = this.myBaseUrl + '?sort=PRICE_DESC'; // очистить фильтр желаний
  sortWishesByPriorityUrl = this.myBaseUrl + '?sort=PRIOR'; // очистить фильтр желаний
  wishesWithoutSortUrl = this.myBaseUrl + '?sort=ALL'; // очистить фильтр желаний
  groupWishesUrl = this.myBaseUrl + '/groups';
  changePriorityMonthUrl = this.myBaseUrl + '/changemonth'; // url для быстрого изменения приоритета
  changePriorityMonthManualyUrl = this.myBaseUrl + '/transferwish'; // url для быстрого изменения приоритета
  searchWishesUrl = this.myBaseUrl + '/filter'; // поиск желаний


  // --------------------------------- ПЕРЕМЕННЫЕ -------------------------------------

  error: any; // отображение ошибок в алертах
  result: any; // отображение результатов в алертах
  implemetedSummAllTime = ''; // общая сумма реализованного за все время
  implemetedSummMonth = ''; // общая сумма реализованного за текущий месяц
  monthOrdermode = false; // режим отображение дерева группировки по месяцам
  isSalaryExists = false;
  lastSalary = 0;
  curDateFormated = '';

// --------------------------------- ВКЛЮЧЕНИЕ МОДАЛОВ -------------------------------------

  isEdit: boolean; // режим редактирования для отображения / или чтобы спрятать модальное окно
  isSalaryAdd: boolean; // режим добавления зп
  isEditMode = false; // редактировать или добавить
  isCsvParse = false; // отправить на парсинг csv
  isFilterModal: boolean; // вывести модал поиска
  isMonthGroupModeWishEdit = false; // вывод формы редактирования желания при помесячной группировке
  isSummInfoForm = false; // вывод формы с итоговой информацией (сумма всех желаний, время реализации)

  // --------------------------------- ХРАНИЛИЩА -------------------------------------

  asyncWishList: Subject<Wish[]> = new Subject(); // асинхронный контейнер желаний
  wishGroups: WishListGroup[] = []; // контейнер желаний
  asyncWishGroups: Subject<WishListGroup[]> = new Subject(); // асинхронный контейнер желаний с помесячной группировкой
  monthList = []; // контейнер месяцев

  filterTypes = ['Все', 'Приоритет', 'Очистить фильтр', 'Помесячная группировка']; // фильтры
  groupMonthSort = ['Без сортировки', 'По имени', 'По сумме [1..10]', 'По сумме [10..1]']; // сортировка помесячной группировки

  // --------------------------------- ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ И ЕГО ДАННЫЕ -------------------------------------

  userRole: string;
  private subscription: Subscription;
  globalError: MessageCode;

  // --------------------------------- ФОРМЫ -------------------------------------
  MonthGroupModeWishEdit = this.fb.group({ // форма редактирования желания при помесячной группировке
    id: ['', [
      Validators.required
    ]],
    wish: ['', [
      Validators.required
    ]],
    month: ['', [
      Validators.required
    ]]
  });

  constructor(private commonService: CommonService, private httpService: HttpService, private fb: FormBuilder,
              private datePipe: DatePipe) {
    this.curDateFormated = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  }

  ngOnInit() {
    this.getWishesWithMonthGrouping('?sortType=all');
    this.subscription = this.commonService.error$.subscribe(error => {
      if (error == null) {
        this.globalError = new MessageCode();
        this.globalError.messageType = 'NO ERRORS';
      } else {
        this.globalError = error;
        this.isEdit = false;

        if (this.globalError.messageType === this.globalError.AUTH_LOGIN_OK) {
          // this.getWishesWithMonthGrouping('?sortType=all');
        } else if (this.globalError.messageType === this.globalError.USER_DATA_CHANGE_OK) {
          this.isEdit = false;
          this.result = this.globalError.USER_DATA_CHANGE_OK;
          timer(4000).subscribe(() => {
            this.result = null;
          });
        } else {
          this.error = error.messageType;
          timer(4000).subscribe(() => {
            this.error = null;
          });
        }
      }
    });
  }

  /**
   *  Получить список желаний, сгруппированый по месяцам.
   *
   *  sorting - тип сортировки.
   */
  getWishesWithMonthGrouping(sorting: string) {

    this.httpService.getData(this.groupWishesUrl + sorting).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно получить желания!');
      })
    ).subscribe(data => {
      this.asyncWishGroups.next(data.list);
      this.monthList.length = 0;
      data.list.forEach((element) => {
        this.monthList.push(element.monthName + ' ' + element.year);
        console.log(this.monthList);
      });
      this.monthOrdermode = true;
    });
  }

  // Применить изменение (месячного) порядка для желания
  applyMonthChange4Wish() {
    console.log(this.MonthGroupModeWishEdit.value.month);

    this.httpService.getData(this.changePriorityMonthManualyUrl + '?id=' +
      this.MonthGroupModeWishEdit.value.id + '&month=' +
      this.MonthGroupModeWishEdit.value.month).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно изменить приоритет!');
      })
    ).subscribe(res => {
      console.log(res);
      this.showAlert('Приоритет успешно изменен! ', 'ADD MODE', res);
      this.getWishesWithMonthGrouping('?sortType=all');
      this.isMonthGroupModeWishEdit = false;
    });
  }

  // Редактирование желания при помесячной группировке
  editMonthGroupItem(items: WishGroupItem) {
    this.isMonthGroupModeWishEdit = true;
    this.MonthGroupModeWishEdit.patchValue({
      id: items.id,
      wish: items.wish
    });
  }


  // Изменить сортировку помесячной группировки
  sortGroupList(item: string) {
    if (item === 'По имени') {
      this.getWishesWithMonthGrouping('?sortType=name');
    } else if (item === 'По сумме [1..10]') {
      this.getWishesWithMonthGrouping('?sortType=price-asc');
    } else if (item === 'Без сортировки') {
      this.getWishesWithMonthGrouping('?sortType=all');
    } else {
      this.getWishesWithMonthGrouping('?sortType=price-desc');
    }
  }

  /**
   * Обработчик ошибок.
   *
   * err
   * message
   */
  errorHandler(err, message: string) {
    this.isEdit = false;
    this.isSalaryAdd = false;
    console.log('error - ' + err.error);
    if (err.error === 'ERR-01') {
      this.error = 'У вас нет сохраненных зарплат! Невозможно посчитать сроки реализации! Добавьте хотя бы одну зарплату!';
      this.isSalaryExists = false;
      this.asyncWishList = null;
      this.filterTypes = ['Все', 'Приоритет', 'Очистить фильтр'];
    } else if (err.error === 'ERR-02') {
      this.error = 'У вас нет сохраненных желаний! Добавьте хотя бы одно желание!';
      this.isSalaryExists = false;
      this.filterTypes = ['Все', 'Приоритет', 'Очистить фильтр'];
    } else {
      this.error = message;
    }
    console.log(err);
    timer(4000).subscribe(() => {
      this.error = null;
    });
    return throwError(err);
  }

  showAlert(text: string, mode: string, result: any) {
    this.isEdit = false;
    this.isSalaryAdd = false;
    this.isCsvParse = false;
    this.result = text;
    timer(4000).subscribe(() => {
      this.result = null;
    });
  }

  changePriorityMonth(item: WishGroupItem, move: string) {

    console.log('URL ->' + this.changePriorityMonthUrl + '/' + item.id + '/' + move);
    this.httpService.getData(this.changePriorityMonthUrl + '/' + item.id + '/' + move).pipe(
      catchError(err => {
        return this.errorHandler(err, 'Невозможно изменить приоритет!');
      })
    ).subscribe(res => {
      console.log(res);
      this.showAlert('Приоритет успешно изменен! ', 'ADD MODE', res);
      this.getWishesWithMonthGrouping('?sortType=all');
    });
  }
}
