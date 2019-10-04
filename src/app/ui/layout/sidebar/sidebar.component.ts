import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-sidebar',
  template: `
    <!--<div class="content-container">-->
      <!--<div class="content-area">-->
      <!--</div>-->
      <clr-vertical-nav [clr-nav-level]="1">
        <a clrVerticalNavLink routerLink="../401" routerLinkActive="active">О проекте</a>
        <a *ngIf="idToken" clrVerticalNavLink routerLink="../" routerLinkActive="active">Главная</a>
      </clr-vertical-nav>
  `,
  styles: []
})
export class SidebarComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
    const idToken = localStorage.getItem('token');
  }

}
