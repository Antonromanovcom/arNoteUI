import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutComponent} from './layout/layout.component';
import {HeaderComponent} from './layout/header/header.component';
import {SidebarComponent} from './layout/sidebar/sidebar.component';
import {InvestingComponent} from './layout/investing/investing.component';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {ClarityModule} from '@clr/angular';
import {MainComponent} from './layout/main/main.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {EditComponent} from './layout/edit/edit.component';
import {BasicAuthHtppInterceptorService} from '../service/basicauthhtppInterceptorservice';
import {AppRoutingModule} from '../app-routing/app-routing.module';
import {UnauthorizeComponent} from './layout/unauthorize/unauthorize.component';
import {JwtHelperService, JWT_OPTIONS} from '@auth0/angular-jwt';
import {SessionTimeoutModalComponent} from './layout/session-timeout-modal/session-timeout-modal.component';
import {ArModalComponent} from './layout/new-modal/ar-modal.component';
import {MonthsComponent} from './layout/monthgrouping/monthgrouping.component';
import {FinPlanningComponent} from './layout/finplanning/finplanning.component';


@NgModule({
  declarations: [LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    MainComponent,
    MonthsComponent,
    FinPlanningComponent,
    EditComponent,
    UnauthorizeComponent,
    InvestingComponent,
    ArModalComponent,
    SessionTimeoutModalComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    ClarityModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: BasicAuthHtppInterceptorService, multi: true},
    {provide: JWT_OPTIONS, useValue: JWT_OPTIONS},
    JwtHelperService
  ],
  exports: [LayoutComponent]
})
export class UiModule {
}
