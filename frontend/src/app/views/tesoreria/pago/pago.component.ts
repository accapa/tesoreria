import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { PagoService } from './pago.service';
import { GrupoService } from '../../admin/grupo/grupo.service';
import { ConfirmDialogService } from 'src/app/shared/confirm/confirm.app.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Grupo } from '../../admin/grupo/grupo.model';
import { Pago } from './pago.model';
import { BaseComponent } from '../../../shared/base/base.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { ArchivoService } from 'src/app/views/archivo/archivo.service';
import { SelectedFile } from '../../../shared/services/selected-file-model.interface';
import { Alumno } from '../../admin/alumno/alumno.model';
import { AlumnoService } from '../../admin/alumno/alumno.service';

@Component({
  selector: 'app-activo',
  templateUrl: './pago.component.html',
  styleUrls: ['./pago.component.scss']
})
export class PagoComponent extends BaseComponent {
  resourceUrl: string = '';
  modalListMantFormVisible = false;
  modalFormVisible = false;
  modalMantFormVisible = false;
  modalListAsignacionVisible = false;
  activos: Pago[] | null = null;
  activo: any | null = null;
  grupos: Grupo[] | null = null;
  alumnos: Alumno[] | null = null;
  pagoForm!: FormGroup;
  searchForm!: FormGroup;
  showFormSearch = false;
  showFormTarjeta = false;
  modalFotoVisible: boolean = false;
  selectedActivoItems: Set<number> = new Set();
  selectedFilesProducto: SelectedFile[] = [];
  listImagenes: any[] = [];
  strIdArchivo = '';
  idPago = '';
  constructor(
    private confDiService: ConfirmDialogService, route: ActivatedRoute, private router: Router,
    private formBuilder: FormBuilder, private toastService: ToastService,
    public _spinner: NgxSpinnerService,
    private pagoService: PagoService,
    private sucursalService: GrupoService,
    private archivoService: ArchivoService,
    private alumnoService: AlumnoService
  ) {
    super(_spinner, route, confDiService);
  }

  ngOnInit(): void {
    this.resourceUrl = this.pagoService.resourceUrl;
    this.handleNavigation();
    this.createSearchForm();
    this.createPagoForm();
  }

  private listGrupo(): void {
    this.sucursalService.listGrupoCombo().subscribe({
      next: (res: any) => {
        this.grupos = res;
      },
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  private createPagoForm(): void {
    this.pagoForm = this.formBuilder.group(
      {
        idPago: [null],
        idGrupo: [null, [Validators.required]],
        idAlumno: [null],
        operacion: [null, [Validators.required]],
        monto: [null, [Validators.required, Validators.pattern(/^\d*\.?\d+$/), Validators.max(9999), Validators.min(0)]],
        fechaComprobante: [null, [Validators.required]],
        observacion: [null, [Validators.required]],
        imgsPago: [[]],
      }
    );
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        idPago: [null],
        idGrupo: [null],
        operacion: [null],
        nombres: [null],
        observacion: [null],
        fechaDesde: [null],
        fechaHasta: [null],
      }
    );
  }

  public toggleForm(): void {
    this.modalFormVisible = !this.modalFormVisible;
    if (this.modalFormVisible === true) {
      this.showFormTarjeta = false;
      this.loadCombos();
    }
  }

  public handleModalChange(event: boolean) {
    this.modalFormVisible = event;
    if (!this.modalFormVisible) {
      this.pagoForm.reset();
    }
  }

  public handleModalChangeImg(event: boolean) {
    this.modalFotoVisible = event; 
  }

  public generarRecibo(): void {
    if (this.selectedActivoItems.size === 0) {
      this.toastService.addToast({ title: 'Aviso', color: 'warning', msg: 'Seleccione un registro' });
      return;
    }
    const idPago = Array.from(this.selectedActivoItems)[0];
    this.router.navigate([`/tesoreria/activo/acta/${idPago}/hojaVida`]);
  }

  override loadAll(): void {
    this.spinner.show();
    const searchForm = this.searchForm?.getRawValue();
    this.pagoService
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
          this.activos = res.body?.data;
          this.selectedActivoItems = new Set();
        },
        error: (e) => { this.spinner.hide(); this.toastService.onError(e); }
      });
  }

  public onSubmit() {
    if (this.pagoForm.status !== 'VALID') {
      this.toastService.addToast({ title: 'Error', color: 'warning', msg: 'Faltan datos para registrar' });
      return;
    }
    this.spinner.show();
    const formData = new FormData();
    for (const img of this.selectedFilesProducto) {
      formData.append('imgsPago[]', img.file, img.file.name);
    }
    for (const controlName in this.pagoForm.controls) {
      const control = this.pagoForm.controls[controlName];
      formData.append(controlName, control.value ? control.value : '');
    }
    this.pagoService.save(formData).subscribe({
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
    this.loadAll();
    this.onResetActivoForm(); //Cierra y resetea el formulario
  }

  override deleting(row: any): void {
    this.pagoService.delete(row.idPago).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastService.addToast({ msg: 'Eliminado con éxito' });
        this.loadAll();
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
    });
  }

  public getData(compra: Pago): void {
    if (!compra.idPago) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.spinner.show();
    this.pagoService.find(compra.idPago).subscribe({
      next: (compra: Pago) => {
        this.loadCombos();
        this.spinner.hide();
        this.modalFormVisible = !this.modalFormVisible;
        this.pagoForm.patchValue(compra);
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  private loadCombos(): void {
    if (!this.grupos)
      this.listGrupo();
  }

  public toggleSearchForm(): void {
    this.showFormSearch = !this.showFormSearch;
    if (this.showFormSearch)
      this.loadCombos();
  }

  public onResetSearchForm() {
    this.searchForm.reset();
    this.handleNavigation();
  }

  public onResetActivoForm() {
    this.pagoForm.reset();
    this.toggleForm();
  }

  toggleCheckboxAct(activo: Pago): void {
    this.unSelect()
    activo.selected = !activo.selected;
    if (activo.selected) {
      this.selectedActivoItems.add(activo.idPago ?? 0);
    } else {
      this.selectedActivoItems.delete(activo.idPago ?? 0);
    }
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

  deleteTmpImgPago(image: SelectedFile): void {
    const index = this.selectedFilesProducto.indexOf(image);
    if (index !== -1)
      this.selectedFilesProducto.splice(index, 1);
  }

  toggleFotosModal(): void {
    this.modalFotoVisible = !this.modalFotoVisible;
  }

  onSlide(event: any): void {
    this.strIdArchivo = event.current
  }

  deleteArchivo(): void {
    this.confirmDialogService?.confirm('Confirmar', '¿Está seguro de eliminar?')
      .then((confirmed) => {
        if (!confirmed)
          return;
        this.spinner.show();
        this.pagoService.deleteArchivo(this.strIdArchivo).subscribe({
          next: () => {
            this.spinner.hide();
            this.toastService.addToast({ msg: 'Eliminado con éxito' });
            this.listArchivos(this.idPago);
          },
          error: e => { this.spinner.hide(); this.toastService.onError(e); }
        });
      }).catch(() => console.log('cancelado...'));
  }

  listArchivos(idPago: string): void {
    this.idPago = idPago;
    this.modalFotoVisible = true;
    this.archivoService.listArchivosByPago(idPago, 'pago').subscribe({
      next: (imagenes: any) => {
        this.listImagenes = imagenes;
        if (this.listImagenes.length > 0) {
          this.strIdArchivo = this.listImagenes[0].idArchivo
        }
      },
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  public onGrupoChange(e: any): void {
    this.pagoForm.controls['idAlumno'].setValue(null);
    if (e?.idGrupo)
      this.listAlumno();
  }

  private unSelect(): void {
    for (const otroActivo of this.activos ?? []) {
      if (otroActivo.selected) {
        otroActivo.selected = false;
        this.selectedActivoItems.delete(otroActivo.idPago ?? 0);
      }
    }
  }

  private listAlumno(): void {
    const idGrupo = this.pagoForm.get('idGrupo')?.getRawValue();
    if (!idGrupo)
      return;
    this.alumnoService.listAlumnoByGrupo(idGrupo).subscribe({
      next: (res: Alumno[]) => {
        this.alumnos = res;
      },
      error: e => this.toastService.onError(e)
    });
  }
}
