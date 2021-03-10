import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from '../ui/layout/main/main.component';
import {BrowserModule} from '@angular/platform-browser';
import {UnauthorizeComponent} from '../ui/layout/unauthorize/unauthorize.component';
import {InvestingComponent} from '../ui/layout/investing/investing.component';
import {AuthGuardService as AuthGuard} from '../service/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '401',
    component: UnauthorizeComponent
  },
  {
    path: 'investing',
    component: InvestingComponent,
    canActivate: [AuthGuard]
  }
  /*,
  { path: '**', redirectTo: '401' }*/
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    CommonModule
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
