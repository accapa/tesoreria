import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { EgresoService } from './egreso.service';
import { GrupoService } from '../../admin/grupo/grupo.service';
import { Egreso } from './egreso.model';
import { Pago } from '../pago/pago.model';
import { Grupo } from '../../admin/grupo/grupo.model';
import { ConfirmDialogService } from 'src/app/shared/confirm/confirm.app.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../shared/base/base.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Concepto } from '../../admin/concepto/concepto.model';
import { ConceptoService } from '../../admin/concepto/concepto.service';
import { SelectedFile } from '../../../shared/services/selected-file-model.interface';
import { ArchivoService } from '../../archivo/archivo.service';

@Component({
  selector: 'app-activo',
  templateUrl: './egreso.component.html',
  styleUrls: ['./egreso.component.scss']
})
export class EgresoComponent extends BaseComponent {
  resourceUrl: string = ''
  modalFormVisible: boolean = false;
  asignaciones: Egreso[] | null = null;
  grupos: Grupo[] | null = null;
  conceptos: Concepto[] | null = null;
  activos: Pago[] | null = null;
  activosAdded: Pago[] | null = null;
  activoFijo: Pago | null = null;
  egresoForm!: FormGroup;
  searchForm!: FormGroup;
  showFormSearch = false;
  showFormTarjeta = false;
  modalActivoFijoVisible = false;
  tmpUbicacion = '';
  idEgreso = '';
  selectedFilesProducto: SelectedFile[] = [];
  modalFotoVisible: boolean = false;
  listImagenes: any[] = [];
  strIdArchivo = '';
  totalMonto = 0;
  constructor(
    private confDiService: ConfirmDialogService, route: ActivatedRoute, private router: Router,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    public _spinner: NgxSpinnerService,
    private egresoService: EgresoService,
    private sucursalService: GrupoService,
    public conceptoService: ConceptoService,
    private archivoService: ArchivoService
  ) {
    super(_spinner, route, confDiService);
  }

  ngOnInit(): void {
    this.resourceUrl = this.archivoService.resourceUrl;
    this.handleNavigation();
    this.createSearchForm();
    this.createAsignacionForm();
  }

  ngOnDestroy(): void {
  }

  private listGrupo(): void {
    this.sucursalService.listGrupoCombo().subscribe({
      next: (res: any) => {
        this.grupos = res;
      },
      error: e => this.toastService.onError(e)
    });
  }

  private listConcepto(): void {
    const idGrupo = this.egresoForm.get('idGrupo')?.getRawValue();
    if (!idGrupo)
      return;
    this.conceptoService.listConceptoByGrupo(idGrupo).subscribe({
      next: (res: any) => {
        this.conceptos = res;
      },
      error: e => this.toastService.onError(e)
    });
  }

  private createAsignacionForm(): void {
    this.egresoForm = this.formBuilder.group(
      {
        idEgreso: [''],
        idGrupo: ['', [Validators.required]],
        idConcepto: [''],
        fechaComprobante: ['', [Validators.required]],
        operacion: [''],
        monto: ['', [Validators.required]],
        observacion: ['', [Validators.maxLength(500)]],
        imgsPago: [[]],
        fechaRegistro: [''],
      }
    );
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        idGrupo: [''],
        id_area: [''],
        fechaRegDesde: [''],
        fechaRegHasta: [''],
        estado: [''],
      }
    );
  }

  public toggleForm(): void {
    this.modalFormVisible = !this.modalFormVisible;
    if (this.modalFormVisible) {
      this.egresoForm.get('fechaComprobante')?.setValue(new Date().toISOString().slice(0, 10));
      this.showFormTarjeta = false;
      this.loadCombos();
    }
  }

  public handleModalChange(event: boolean) {
    this.modalFormVisible = event;
    if (!this.modalFormVisible) {
      this.egresoForm.reset();
    }
  }

  override loadAll(): void {
    this.spinner.show();
    const searchForm = this.searchForm?.getRawValue();
    this.egresoService
      .query({
        ...{
          page: this.page,
          size: this.itemsPerPage,
          sort: [`${this.predicate},${this.ascending ? 'asc' : 'desc'}`]
        }, ...searchForm
      })
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.totalItems = res.body.total;
          this.page = res.body.current_page;
          this.itemsPerPage = res.body.per_page;
          this.asignaciones = res.body?.data;
          this.totalMonto = this.asignaciones?.reduce((total, dato) => total + dato.monto, 0) ?? 0;
        },
        error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
      });
  }

  public onSubmit() {
    if (this.egresoForm.status !== 'VALID') {
      this.toastService.addToast({ title: 'Error', color: 'warning', msg: 'Faltan datos para registrar' });
      return;
    }

    this.spinner.show();
    const formData = new FormData();
    for (const img of this.selectedFilesProducto) {
      formData.append('imgsPago[]', img.file, img.file.name);
    }
    for (const controlName in this.egresoForm.controls) {
      const control = this.egresoForm.controls[controlName];
      formData.append(controlName, control.value ? control.value : '');
    }
    this.egresoService.save(formData).subscribe({
      next: () => this.onSaveSuccess(),
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  public searchSubmit() {
    this.loadAll()
  }

  private onSaveSuccess(): void {
    this.spinner.hide();
    this.toastService.addToast({ msg: 'Registrado con éxito.' });
    this.modalFormVisible = false;
    this.loadAll();
  }

  override deleting(row: any): void {
    this.egresoService.delete(row.idEgreso).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastService.addToast({ msg: 'Eliminado con éxito' });
        this.loadAll();
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
    });
  }

  public deleteAsignacionDet(id_asignaciondet: number): void {
    this.confirmDialogService?.confirm('Confirmar', '¿Está seguro de eliminar?')
      .then((confirmed) => {
        if (!confirmed)
          return;
        this.spinner.show();
        this.egresoService.deleteAsignacionDet(id_asignaciondet).subscribe({
          next: () => {
            this.spinner.hide();
            this.toastService.addToast({ msg: 'Eliminado con éxito' });
          },
          error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
        });
      })
      .catch(() => console.log('cancelado...'));
  }

  public getData(asignacion: Egreso): void {
    if (!asignacion.idEgreso) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.spinner.show();
    this.egresoService.find(asignacion.idEgreso).subscribe({
      next: (asignacion: Egreso) => {
        this.spinner.hide();
        this.modalFormVisible = !this.modalFormVisible;
        this.egresoForm.patchValue(asignacion);
        setTimeout(() => {
          this.loadCombos();
        }, 500);
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
    });
  }

  private loadCombos(): void {
    if (!this.grupos) {
      this.listGrupo();
    }
    this.listConcepto();
  }

  public toggleSearchForm(): void {
    this.showFormSearch = !this.showFormSearch;
    this.loadCombos();
  }

  public onResetSearchForm() {
    this.searchForm.reset();
    this.handleNavigation();
  }

  public onResetAsignacionForm() {
    this.egresoForm.reset();
    this.toggleForm();
  }

  public onGrupoChange(e: any): void {
    this.egresoForm.controls['idConcepto'].setValue('');
    if (e?.idGrupo)
      this.listConcepto();
  }

  public toExcel(): void {
    this.spinner.show();
    this.egresoService
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
          this.dataDownload(data, 'Reporte_asignacion.xlsx');
        },
        error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
      });
  }

  public onFileChange(event: any) {
    const files: File[] = event.target.files;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFilesProducto.push({ file, previewUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  public deleteTmpImgPago(image: SelectedFile): void {
    const index = this.selectedFilesProducto.indexOf(image);
    if (index !== -1)
      this.selectedFilesProducto.splice(index, 1);
  }

  public listArchivos(idEgreso: string): void {
    this.idEgreso = idEgreso;
    this.modalFotoVisible = true;
    this.archivoService.listArchivosByPago(idEgreso, 'egreso').subscribe({
      next: (imagenes: any) => {
        this.listImagenes = imagenes;
        if (this.listImagenes.length > 0) {
          this.strIdArchivo = this.listImagenes[0].idArchivo
        }
      },
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  public deleteArchivo(): void {
    if (this.strIdArchivo === '') {
      this.toastService.addToast({ title: 'Aviso', color: 'warning', msg: 'No existe archivo para eliminar' });
      return;
    }
    this.confirmDialogService?.confirm('Confirmar', '¿Está seguro de eliminar?')
      .then((confirmed) => {
        if (!confirmed)
          return;
        this.spinner.show();
        this.archivoService.delete(this.strIdArchivo).subscribe({
          next: () => {
            this.spinner.hide();
            this.toastService.addToast({ msg: 'Eliminado con éxito' });
            this.listArchivos(this.idEgreso);
          },
          error: e => { this.spinner.hide(); this.toastService.onError(e); }
        });
      }).catch(() => console.log('cancelado...'));
  }

  public onSlide(event: any): void {
    this.strIdArchivo = event.current
  }

  public handleModalChangeImg(event: boolean) {
    this.modalFotoVisible = event;
    if (!this.modalFotoVisible) {
      this.strIdArchivo = '';
    }
  }
}
