import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent } from './confirm.app.component';

@Injectable()
export class ConfirmDialogService {
    constructor(private modalService: NgbModal) { }
    public confirm(
        title: string,
        message: string,
        btnOkText: string = 'Si',
        btnCancelText: string = 'No',
        dialogSize: 'sm' | 'lg' = 'sm'): Promise<boolean> {
        const modalRef = this.modalService.open(ConfirmDialogComponent, { size: dialogSize });
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.message = message;
        modalRef.componentInstance.btnOkText = btnOkText;
        modalRef.componentInstance.btnCancelText = btnCancelText;
        return modalRef.result;
    }
}
