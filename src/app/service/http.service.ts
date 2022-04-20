import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Wish} from '../dto/wish';
import {Salary} from '../dto/salary';
import {User} from '../dto/user';
import {environment} from '../../environments/environment';
import {NewInstrumentRq} from '../dto/NewInstrumentRq';
import {Bond} from '../dto/bond';
import {SearchRq} from '../dto/searchwishes';
import {NewLoanRq} from '../dto/NewLoanRq';
import {EditLoanRq} from '../dto/EditLoanRq';
import {NewIncomeRq} from '../dto/NewIncomeRq';
import {GetDetailedBalanceRq} from '../dto/GetDetailedBalanceRq';
import {GetLoansByDateRq} from '../dto/GetLoansByDateRq';
import {NewGoalRq} from '../dto/NewGoalRq';
import {DeleteIncomesRq} from '../dto/DeleteIncomesRq';
import {SalaryRq} from '../dto/SalaryRq';
import {NewFreezeRq} from '../dto/NewFreezeRq';
import {FinPlan} from '../dto/finplan';
import {ToggleDeltaRq} from '../dto/ToggleDeltaRq';


@Injectable()
export class HttpService {

  SERVER_URL: string = environment.serverUrl;
  loginURL = this.SERVER_URL + '/login?';
  isCryptoUserUrl = this.SERVER_URL + '/rest/wishes/users/getcurrent';


  constructor(private http: HttpClient) {
  }

  public getData(url: string): Observable<any> {
    return this.http.get(url);
  }

  public searchWishes(request: SearchRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<Wish>(url, request, httpOptions);
  }

  public sendData(wish: Wish, url: string): Observable<Wish> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<Wish>(url, wish, httpOptions);
  }

  public addInstrument(instrument: NewInstrumentRq, url: string): Observable<Bond> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Bond>(url, instrument, httpOptions);
  }

  public addLoan(loan: NewLoanRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<NewLoanRq>(url, loan, httpOptions);
  }

  public addGoal(loan: NewGoalRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<NewGoalRq>(url, loan, httpOptions);
  }

  public editGoal(loan: NewGoalRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.put<NewGoalRq>(url, loan, httpOptions);
  }

  public editSalary(loan: SalaryRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.put<SalaryRq>(url, loan, httpOptions);
  }

  public addIncome(loan: NewIncomeRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<NewIncomeRq>(url, loan, httpOptions);
  }

  public addFreeze(loan: NewFreezeRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<NewFreezeRq>(url, loan, httpOptions);
  }

  public getDetailedBalance(request: GetDetailedBalanceRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<GetDetailedBalanceRq>(url, request, httpOptions);
  }

  public getLoansByDate(request: GetLoansByDateRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<GetLoansByDateRq>(url, request, httpOptions);
  }

  public editLoan(loan: EditLoanRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.put<NewLoanRq>(url, loan, httpOptions);
  }

  public editIncome(loan: NewIncomeRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.put<NewIncomeRq>(url, loan, httpOptions);
  }

  public deleteIncomes(incomes: DeleteIncomesRq, url: string): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post(url, incomes, httpOptions);
  }

  public deleteInstrument(ticker: string, url: string): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.delete(url + '?ticker=' + ticker, httpOptions);
  }

  public deleteFinPlanningEntity(id: number, url: string): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.delete(url + '?id=' + id, httpOptions);
  }

  public sendFile(formData: FormData, url: string): Observable<any> {
    return this.http.post<any>(url, formData);
  }

  public sendSalary(salary: Salary, url: string): Observable<Salary> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<Salary>(url, salary, httpOptions);
  }

  public updateWish(wish: Wish, url: string): Observable<Wish> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put<Wish>(url, wish, httpOptions);
  }

  public deleteWish(id: string, url: string): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.delete(url + '/' + id, httpOptions);
  }


  public login(loginPayload): Observable<HttpResponse<Object>> {

    console.log('loginPayload ->' + loginPayload);

    const headers = {
      'Content-type': 'application/x-www-form-urlencoded'
    };

    return this.http.get<HttpResponse<Object>>(this.loginURL + loginPayload, {observe: 'response'});
  }

  public isCryptoUser(): Observable<any> {
    return this.http.get(this.isCryptoUserUrl);
  }

  public updateUserData(user: User, url: string): Observable<User> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.put<User>(url, user, httpOptions);
  }

  public addSalary(loan: SalaryRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<SalaryRq>(url, loan, httpOptions);
  }

  public toggleDelta(loan: ToggleDeltaRq, url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<ToggleDeltaRq>(url, loan, httpOptions);
  }

  public deleteFreeze(selectedFinPlan: FinPlan, url: string): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.delete(url + '?year=' + selectedFinPlan.year + '&month=' + selectedFinPlan.monthNumber, httpOptions);
  }
}
