import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../../shared/base/base.component';
import { ConfirmDialogService } from '../../../../shared/confirm/confirm.app.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { ExcelService } from './excel.service';

@Component({
  selector: 'app-activo-reporte-excel',
  templateUrl: './excel.component.html',
  styleUrls: ['./excel.component.scss']
})
export class ExcelComponent extends BaseComponent {
  modalDepreciacionVisible = false;
  modalMantVisible = false;
  modalGarantiaVisible = false;
  depreciacionForm!: FormGroup;
  mantenimientoForm!: FormGroup;
  garantiaForm!: FormGroup;
  constructor(
    private confDiService: ConfirmDialogService, route: ActivatedRoute, private router: Router,
    private formBuilder: FormBuilder, private toastService: ToastService,
    public _spinner: NgxSpinnerService,
    private excelService: ExcelService,
  ) {
    super(_spinner, route, confDiService);
  }

  ngOnInit(): void {
    this.handleNavigation();
    this.createDepreciacionForm();
    this.createMantenimientoForm();
    this.createGarantiaForm();
  }

  private listCategoria(): void {
  
  }

  private listSubCategoria(): void {
  
  }

  private createDepreciacionForm(): void {
    this.depreciacionForm = this.formBuilder.group(
      {
        id_categoria: [null],
        id_subcategoria: [null],
        fechaHasta: [(new Date()).getFullYear(), [Validators.required]],
      }
    );
  }

  private createMantenimientoForm(): void {
    this.mantenimientoForm = this.formBuilder.group(
      {
        fechaDesde: [null, [Validators.required]],
        fechaHasta: [null, [Validators.required]],
      }
    );
  }

  private createGarantiaForm(): void {
    this.garantiaForm = this.formBuilder.group(
      {
        fechaDesde: [null, [Validators.required]],
        fechaHasta: [null, [Validators.required]],
        esVencido: [null],
      }
    );
  }

  public closeModalDepreciacion(): void {
    this.modalDepreciacionVisible = false;
  }

  public closeModalMant(): void {
    this.modalMantVisible = false;
  }

  public closeModalGarantia(): void {
    this.modalGarantiaVisible = false;
  }

  public handleModalChange(event: boolean) {
    this.modalDepreciacionVisible = event;
    if (!this.modalDepreciacionVisible) {
      this.depreciacionForm.reset();
    } else {
      this.listCategoria();
    }
  }

  public handleModalMantChange(event: boolean) {
    this.modalMantVisible = event;
    if (!this.modalMantVisible) {
      this.mantenimientoForm.reset();
    }
  }

  public handleModalGarantiaChange(event: boolean) {
    this.modalGarantiaVisible = event;
    if (!this.modalGarantiaVisible) {
      this.garantiaForm.reset();
    }
  }

  public handleDepreciacionModalChange(event: boolean) {
    this.modalDepreciacionVisible = event;
  }


  public onResetDepreciacionForm() {
    this.depreciacionForm.reset();
    this.modalDepreciacionVisible = false;
  }

  public onSubmit(): void {
    this.spinner.show();
    this.excelService
      .repDepreciacion(this.depreciacionForm?.getRawValue())
      .subscribe({
        next: (data: any) => {
          this.spinner.hide();
          this.dataDownload(data, 'Depreciacion.xlsx');
        },
        error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
      });
  }

  public onCategoriaChange(e: any): void {
    this.depreciacionForm.get('id_subcategoria')?.setValue('');
    if (e?.id_categoria)
      this.listSubCategoria();
  }

  public onSubmitMant(): void {
    this.spinner.show();
    this.excelService
      .repMantenimiento(this.mantenimientoForm?.getRawValue())
      .subscribe({
        next: (data: any) => {
          this.spinner.hide();
          this.dataDownload(data, 'Mantenimiento.xlsx');
        },
        error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
      });
  }

  public onSubmitGarantia(): void {
    this.spinner.show();
    this.excelService
      .repGarantia(this.garantiaForm?.getRawValue())
      .subscribe({
        next: (data: any) => {
          this.spinner.hide();
          this.dataDownload(data, 'Garantia.xlsx');
        },
        error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
      });
  }

  public toggleVencido($e: any): void {
    const isChecked = $e.target.checked;
    const { fechaDesde, fechaHasta } = this.garantiaForm.controls;
    fechaDesde[isChecked ? 'disable' : 'enable']();
    fechaHasta[isChecked ? 'disable' : 'enable']();
  }
}
