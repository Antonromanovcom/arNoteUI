import {Component, ElementRef, Input, OnDestroy, OnInit} from '@angular/core';
import {ModalService} from '../../../service/modal.service';

@Component({
  selector: 'app-ar-modal',
  template:
    ` <div class="modal" *ngIf="condition">
          <div class="modal-dialog fadeDown in" role="dialog" aria-hidden="true">
            <div class="modal-content">
              <ng-content></ng-content>
            </div>
          </div>
        </div>
    <div class="modal-backdrop fade in" aria-hidden="true" *ngIf="condition"></div>`
})
export class ArModalComponent implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() condition: boolean;
  private element: any;

  constructor(private modalService: ModalService, private el: ElementRef) {
    this.element = el.nativeElement;
  }

  ngOnInit(): void {
    const modal = this;
    console.log('cond = ', this.condition);
    // ensure id attribute exists
    if (!this.id) {
      console.error('modal must have an id');
      return;
    }
    if (!this.condition) {
      this.condition = false;
    }

    // move element to bottom of page (just before </body>) so it can be displayed above everything else
    document.body.appendChild(this.element);

    // add self (this modal instance) to the modal service so it's accessible from controllers
    this.modalService.add(this);
  }

  // remove self from modal service when component is destroyed
  ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  // open modal
  open(): void {
    this.condition = true;
  }

  // close modal
  close(): void {
    this.condition = false;
  }
}
