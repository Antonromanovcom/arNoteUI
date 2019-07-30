import {Component, OnInit} from '@angular/core';
import {CommonService} from '../../service/common.service';
import {HttpService} from '../../service/http.service';
import { JwtHelperService, JWT_OPTIONS  } from '@auth0/angular-jwt';

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
        <app-header></app-header>
      </clr-header>
      <div class="content-container">
        <div class="content-area">
          <!--<app-main></app-main>-->
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
