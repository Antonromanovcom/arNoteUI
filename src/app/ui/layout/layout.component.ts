import {Component, OnInit} from '@angular/core';
import {CommonService} from '../../service/common.service';
import {JwtHelperService, JWT_OPTIONS} from '@auth0/angular-jwt';

@Component({
  selector: 'app-layout',
  template: `
    <clr-main-container>
      <clr-header class="header">
        <app-header></app-header>
      </clr-header>
      <div class="content-container">
        <clr-vertical-nav [clr-nav-level]="1">
          <a clrVerticalNavLink routerLink="../401" routerLinkActive="active">О проекте</a>
          <a *ngIf="idToken" clrVerticalNavLink routerLink="../" routerLinkActive="active">Главная</a>
        </clr-vertical-nav>
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </div>
    </clr-main-container>`,
  styles: [],
  providers: [CommonService, JwtHelperService]
})
export class LayoutComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
