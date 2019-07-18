import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-sidebar',
  template: `
   <!-- <nav class="sidenav">
      <section class="sidenav-content">
        <a class="nav-link active">Overview</a>
        <section class="nav-group collapsible">
          <input id="tabexample1" type="checkbox">
          <label for="tabexample1">Content</label>
          <ul class="nav-list">
            <li><a class="nav-link">Projects</a></li>
            <li><a class="nav-link">Reports</a></li>
          </ul>
        </section>
        <section class="nav-group collapsible">
          <input id="tabexample2" type="checkbox">
          <label for="tabexample2">System</label>
          <ul class="nav-list">
            <li><a class="nav-link">Users</a></li>
            <li><a class="nav-link">Settings</a></li>
          </ul>
        </section>
      </section>
    </nav>-->

    <div class="content-container">
      <div class="content-area">
      </div>
      <clr-vertical-nav>
        <a clrVerticalNavLink routerLink="./charmander" routerLinkActive="active">Charmander</a>
        <a clrVerticalNavLink routerLink="./jigglypuff" routerLinkActive="active">Jigglypuff</a>
        <a clrVerticalNavLink routerLink="./pikachu" routerLinkActive="active">Pikachu</a>
        <a clrVerticalNavLink routerLink="./raichu" routerLinkActive="active">Raichu</a>
        <a clrVerticalNavLink routerLink="./snorlax" routerLinkActive="active">Snorlax</a>
        <div class="nav-divider"></div>
        <a clrVerticalNavLink routerLink="./credit" routerLinkActive="active">Credit</a>
      </clr-vertical-nav>
    </div>

  `,
  styles: []
})
export class SidebarComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
