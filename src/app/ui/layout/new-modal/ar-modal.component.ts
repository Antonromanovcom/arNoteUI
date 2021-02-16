import {Component, Input, OnInit} from '@angular/core';
import {ModalService} from '../../../service/modal.service';

@Component({
  selector: 'app-ar-modal',
  template:
    ` <div class="modal">
          <div class="modal-dialog fadeDown in" role="dialog" aria-hidden="true">
            <div class="modal-content">
              <ng-content></ng-content>
            </div>
          </div>
        </div>
    <div class="modal-backdrop fade in" aria-hidden="true" *ngIf="localCondition"></div>`
})
export class ArModalComponent implements OnInit {
  @Input() id: string;
  @Input() condition: boolean;
  localCondition: boolean;

  constructor(private modalService: ModalService) {
  }

  ngOnInit(): void {
    const modal = this;
    this.localCondition = this.condition;
    // ensure id attribute exists
    if (!this.id) {
      console.error('modal must have an id');
      return;
    }
    if (!this.condition) {
      this.condition = false;
    }
    // add self (this modal instance) to the modal service so it's accessible from controllers
    this.modalService.add(this);
  }

  // open modal
  open(): void {
    this.localCondition = true;
  }

  // close modal
  close(): void {
    this.localCondition = false;
  }
}
