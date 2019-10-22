import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {CommonService} from '../../service/common.service';
import {JwtHelperService} from '@auth0/angular-jwt';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CommonService, JwtHelperService]
})
export class LayoutComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
