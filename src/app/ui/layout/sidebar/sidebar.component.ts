import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-sidebar',
  template: `
      <clr-vertical-nav [clr-nav-level]="1">
        <a clrVerticalNavLink routerLink="../401" routerLinkActive="active">О проекте-хуекте</a>
        <a clrVerticalNavLink routerLink="../" routerLinkActive="active">Главная</a>
      </clr-vertical-nav>
  `,
  styles: []
})
export class SidebarComponent implements OnInit {

  private idToken: string;

  constructor() {
  }

  ngOnInit() {
   this.idToken = localStorage.getItem('token');
  }

}
