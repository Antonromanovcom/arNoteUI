import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import {HttpClientModule} from '@angular/common/http';
import { ClarityModule } from '@clr/angular';
import { MainComponent } from './layout/main/main.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditComponent } from './layout/edit/edit.component';


@NgModule({
  declarations: [LayoutComponent, HeaderComponent, SidebarComponent, MainComponent, EditComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ClarityModule
  ],
  exports: [LayoutComponent]
})
export class UiModule { }
