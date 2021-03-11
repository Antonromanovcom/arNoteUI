import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {UnauthorizeComponent} from './unauthorize.component';

const routes: Routes = [{ path: '', component: UnauthorizeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MoviesRoutingModule { }
