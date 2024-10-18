import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeudaService } from './deuda.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/shared/base/base.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../../../shared/services/search.service';
import { UtilsModule } from '../../../utils/utils.module';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { SelectedFile } from '../../../shared/services/selected-file-model.interface';
import { GrupoService } from '../../admin/grupo/grupo.service';
import { Deuda } from './deuda.model';
import { Saldo } from './saldo.model';
import { PagoService } from '../pago/pago.service';
import { SaldoService } from '../deuda/saldo.service';
import { ConfirmDialogService } from 'src/app/shared/confirm/confirm.app.service';
import { ArchivoService } from '../../archivo/archivo.service';
import { AlumnoService } from '../../admin/alumno/alumno.service';
import { Alumno } from '../../admin/alumno/alumno.model';
import { EstadoDeuda } from 'src/app/shared/base/estado-deuda.enum';
import { Concepto } from '../../admin/concepto/concepto.model';
import { ConceptoService } from '../../admin/concepto/concepto.service';

@Component({
  selector: 'app-af-compra',
  templateUrl: './deuda.component.html',
  styleUrls: ['./deuda.component.scss'],
})
export class DeudaComponent extends BaseComponent {
  resourceUrl: string = ''
  pagoForm!: FormGroup;
  deudaForm!: FormGroup;
  searchForm!: FormGroup;
  alumno!: Alumno;
  modalFormActivoVisible = false;
  modalFotoVisible = false;
  modalDeudaVisible = false;
  deudas: Deuda[] | null = null;
  saldos: Saldo[] | null = null;
  estadoDeudas: any[] | null = null;
  conceptos: Concepto[] | null = null;
  selectedFilesProducto: SelectedFile[] = [];
  listImagenes: any[] = [];
  str_id_archivo: string = '';
  archivo_tipo: string = '';
  private idAlumno: number = 0;
  selectedDeudaItems: Set<number> = new Set();
  totalMonto: number = 0;
  totalSaldo: number = 0;
  tieneSaldo: boolean = false;
  aplicarSaldo: boolean = false;
  readOnlyMonto: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    public _spinner: NgxSpinnerService,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private confirService: ConfirmDialogService,
    private deudaService: DeudaService,
    public grupoService: GrupoService,
    private pagoService: PagoService,
    private archivoService: ArchivoService,
    private alumnoService: AlumnoService,
    private saldoService: SaldoService,
    private conceptoService: ConceptoService,
  ) {
    super(_spinner, route, confirService);
  }

  ngOnInit(): void {
    this.resourceUrl = this.pagoService.resourceUrl;
    this.createCompraForm();
    this.createDeudaForm();
  }

  ngAfterContentInit() {
    this.getParamId();
  }

  private getParamId(): void {
    this.route.paramMap.subscribe(params => {
      const idAlumno = params.get('idAlumno');
      if (UtilsModule.isNumeric(idAlumno!)) {
        this.getData(parseInt(idAlumno!, 10));
      } else if (idAlumno != 'new') {
        this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'El parámetro enviado no es numérico' });
      }
    });
  }

  private createDeudaForm(): void {
    this.deudaForm = this.formBuilder.group(
      {
        idDeuda: [null],
        idAlumno: [null, [Validators.required]],
        idConcepto: [null, [Validators.required]],
        monto: [null, [Validators.required, Validators.pattern(/^\d*\.?\d+$/), Validators.max(9999), Validators.min(0)]],
        montoRestante: [null, [Validators.required, Validators.pattern(/^\d*\.?\d+$/), Validators.max(9999), Validators.min(0)]],
        estadoDeuda: [null, [Validators.required]],
      }
    );
  }

  private createCompraForm(): void {
    this.pagoForm = this.formBuilder.group(
      {
        idPago: [null],
        idAlumno: [null],
        operacion: [null, [Validators.required]],
        monto: [null, [Validators.required, Validators.pattern(/^\d*\.?\d+$/), Validators.max(9999), Validators.min(0)]],
        fechaComprobante: [null, [Validators.required]],
        observacion: [null, [Validators.required]],
        imgsPago: [[]],
        deudas: [[]],
        aplicarSaldo: [null]
      }
    );
    this.searchForm = this.formBuilder.group({idGrupo: ['']});
  }

  private getData(idAlumno: number): void {
    this.idAlumno = idAlumno;
    this.spinner.show();
    this.deudaService.listDeudaByIdAlumno(idAlumno).subscribe({
      next: (deudas: Deuda[]) => {
        this.spinner.hide();
        this.deudas = deudas;
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e); }
    });

    this.saldoService.listSaldoByIdAlumno(idAlumno).subscribe({
      next: (saldos: Saldo[]) => {
        this.saldos = saldos;
        this.totalSaldo = this.saldos?.reduce((sum, sal) => sum + sal.monto, 0) || 0;
        this.tieneSaldo = this.totalSaldo > 0;
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e); }
    });

    this.alumnoService.find(idAlumno + '').subscribe({
      next: (alumno: Alumno) => {
        this.alumno = alumno
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  override deleting(row: any): void {
    this.pagoService.delete(row.idDeuda).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastService.addToast({ msg: 'Eliminado con éxito' });
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
    });
  }

  public toggleFormActivo(): void {
    if (this.selectedDeudaItems.size === 0) {
      this.toastService.addToast({ title: 'Aviso', color: 'warning', msg: 'Seleccione deuda' });
      return;
    }
    this.modalFormActivoVisible = !this.modalFormActivoVisible;
  }

  public cancel(): void {
    this.router.navigate([`/tesoreria/deuda-list`]);
  }

  public printActa(): void {
    const idDeuda = this.pagoForm.get('idDeuda')?.value;
    this.router.navigate([`/tesoreria/deuda/acta/${this.idAlumno ? this.idAlumno : idDeuda}/ingreso`]);
  }

  public toExcel(): void {
    this.spinner.show();
    this.deudaService
      .downloadExcel({
        ...{
          page: this.page,
          size: this.itemsPerPage,
          sort: [`${this.predicate},${this.ascending ? 'asc' : 'desc'}`],
          isToExcel: true,
        }, ...this.searchForm?.getRawValue()
      })
      .subscribe({
        next: (data: any) => {
          this.spinner.hide();
          this.dataDownload(data, 'Reporte_activos.xlsx');
        },
        error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
      });
  }

  public handleModalChange(event: boolean) {
    this.modalFormActivoVisible = event;
  }

  public handleModalDeudaChange(event: boolean) {
    this.modalDeudaVisible = event;
  }

  public onResetActivoForm() {
    this.pagoForm.reset();
    this.toggleFormActivo();
    this.selectedFilesProducto = [];
    this.totalSaldo = this.saldos?.reduce((sum, sal) => sum + sal.monto, 0) || 0;
    this.aplicarSaldo = false;
    this.readOnlyMonto = false;
  }

  public onResetDeudaForm() {
    this.deudaForm.reset();
    this.modalDeudaVisible = false;
  }

  public onPagoSubmit() {
    if (this.pagoForm.status !== 'VALID') {
      this.toastService.addToast({ title: 'Error', color: 'warning', msg: 'Faltan datos para registrar' });
      return;
    }
    if (this.selectedDeudaItems.size === 0) {
      this.toastService.addToast({ title: 'Error', color: 'warning', msg: 'Seleccione deuda' });
      return;
    }
    this.spinner.show();
    const formData = new FormData();
    for (const img of this.selectedFilesProducto) {
      formData.append('imgsPago[]', img.file, img.file.name);
    }
    for (const controlName in this.pagoForm.controls) {
      const control = this.pagoForm.controls[controlName];
      if (controlName === 'deudas') {
        const deudasArray = Array.from(this.selectedDeudaItems);
        formData.append('deudas', JSON.stringify(deudasArray));
      } else if (controlName === 'idAlumno') {
        formData.append('idAlumno', this.idAlumno + '');
      } else {
        formData.append(controlName, control.value ? control.value : '');
      }
    }
    this.pagoService.save(formData).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastService.addToast({ msg: 'Pago registrado con éxito.' });
        this.onResetActivoForm();
        this.getData(this.idAlumno);
        this.totalMonto = 0;
        this.selectedDeudaItems.clear();
      },
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  listArchivos(archivo_tipo: string): void {
    this.archivo_tipo = archivo_tipo;
    const idPago = this.pagoForm.get('idPago')?.getRawValue();
    this.modalFotoVisible = true;
    this.archivoService.listArchivosByPago(idPago, archivo_tipo).subscribe({
      next: (imagenes: any) => {
        this.listImagenes = imagenes;
        if (this.listImagenes.length > 0) {
          this.str_id_archivo = this.listImagenes[0].id_archivo
        }
      },
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  onSlide(event: any): void {
    this.str_id_archivo = event.current
  }

  deleteArchivo(): void {
    this.confirmDialogService?.confirm('Confirmar', '¿Está seguro de eliminar?')
      .then((confirmed) => {
        if (!confirmed)
          return;
        this.spinner.show();
        this.pagoService.deleteArchivo(this.str_id_archivo).subscribe({
          next: () => {
            this.spinner.hide();
            this.toastService.addToast({ msg: 'Eliminado con éxito' });
            this.listArchivos(this.archivo_tipo);
          },
          error: e => { this.spinner.hide(); this.toastService.onError(e); }
        });
      }).catch(() => console.log('cancelado...'));
  }

  toggleFotosModal(): void {
    this.modalFotoVisible = !this.modalFotoVisible;
  }

  onFileChange(event: any) {
    const files: File[] = event.target.files;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFilesProducto.push({ file, previewUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  deleteTmpImgProducto(image: SelectedFile): void {
    const index = this.selectedFilesProducto.indexOf(image);
    if (index !== -1)
      this.selectedFilesProducto.splice(index, 1);
  }

  toggleCheckbox(deuda: Deuda): void {
    if (deuda.estadoDeuda === EstadoDeuda.Pagado) 
      return;
    deuda.selected = !deuda.selected;
    if (deuda.selected) {
      this.selectedDeudaItems.add(deuda.idDeuda ?? 0);
    } else {
      this.selectedDeudaItems.delete(deuda.idDeuda ?? 0);
    }
    this.totalMonto = this.deudas?.filter(deuda => this.selectedDeudaItems.has(deuda.idDeuda))
    .reduce((sum, deuda) => sum + (deuda.montoRestante > 0 ? deuda.montoRestante : deuda.monto), 0) || 0;
  }

  public esPagado(estado?: string | null): boolean {
    if (estado === null || estado === undefined || estado === '') {
      return false;
    }
    return estado === EstadoDeuda.Pagado;
  }

  public toggleAplicaSaldo($e: any): void {
    this.aplicarSaldo = $e.target.checked;
    let _monto = this.totalSaldo;
    if (this.aplicarSaldo) {
      if (this.totalSaldo >= this.totalMonto) {
        _monto = this.totalMonto;
        this.totalSaldo -= this.totalMonto;
        this.readOnlyMonto = true;
      } 
    } else {
      this.totalSaldo = this.saldos?.reduce((sum, sal) => sum + sal.monto, 0) || 0;
      this.readOnlyMonto = false;
    }
    this.pagoForm.patchValue({monto: this.aplicarSaldo ? _monto : null, aplicarSaldo: this.aplicarSaldo});
  }

  public openDeuda():void {
    if (this.selectedDeudaItems.size === 0) {
      this.toastService.addToast({ title: 'Aviso', color: 'warning', msg: 'Seleccione deuda' });
      return;
    }
    const idDeuda = this.selectedDeudaItems.values().next().value;
    this.deudaService.find(idDeuda).subscribe({
      next: (deuda: Deuda) => {
        this.deudaForm.patchValue(deuda);
        this.modalDeudaVisible = true;
      },
      error: e => {this.spinner.hide(); this.toastService.onError(e);}
    });
    this.listConcepto();
    this.listEstadoDeuda();
  }

  public onDeudaSubmit(): void {
    this.spinner.show();
    this.deudaService.save(this.deudaForm.getRawValue()).subscribe({
      next: () => {
        this.onResetDeudaForm();
        this.spinner.hide();
        this.getParamId();
      },
      error: e => {this.spinner.hide(); this.toastService.onError(e);}
    });
  }

  private listEstadoDeuda(): void {
    this.deudaService.listEstadoDeuda().subscribe({
      next: (res: any) => {
        this.estadoDeudas = res;
      },
      error: e => {this.spinner.hide(); this.toastService.onError(e);}
    });
  }

  private listConcepto(): void {
    this.conceptoService.listConceptoByGrupo(this.alumno.idGrupo || 0).subscribe({
      next: (res: any) => {
        this.conceptos = res;
      },
      error: e => {this.spinner.hide(); this.toastService.onError(e);}
    });
  }
}