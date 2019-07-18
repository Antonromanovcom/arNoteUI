import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-layout',
  template: `
    <!--<div class="main-container">
      <app-header></app-header>
      <app-main>
        <ng-content></ng-content>
      </app-main>
    </div>-->

<clr-main-container>
<clr-header class="header">
<h1> Выход</h1>
</clr-header>
<div class="content-container">
<div class="content-area">
<!--<h3>Настройка сервисов</h3>-->
<!--<app-transaction-log></app-transaction-log>-->
<app-main>
<!--<ng-content></ng-content>-->
</app-main>
</div>
</div>
</clr-main-container>`,
  styles: []
})
export class LayoutComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
