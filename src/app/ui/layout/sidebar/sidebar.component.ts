import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-sidebar',
  template: `

    <div class="content-container">
      <div class="content-area">
      </div>
      <!--<div class="hidden-md-down">-->
      <clr-vertical-nav class="hidden-md-down">
        <a clrVerticalNavLink routerLink="../401" routerLinkActive="active">О проекте</a>
        <a clrVerticalNavLink routerLink="../" routerLinkActive="active">Главная</a>
        <!--<a clrVerticalNavLink routerLink="./pikachu" routerLinkActive="active">Pikachu</a>
        <a clrVerticalNavLink routerLink="./raichu" routerLinkActive="active">Raichu</a>
        <a clrVerticalNavLink routerLink="./snorlax" routerLinkActive="active">Snorlax</a>
        <div class="nav-divider"></div>
        <a clrVerticalNavLink routerLink="./credit" routerLinkActive="active">Credit</a>-->
      </clr-vertical-nav>
      <!--</div>-->

  `,
  styles: []
})
export class SidebarComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
