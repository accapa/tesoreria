import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogService } from 'src/app/shared/confirm/confirm.app.service';
import { BaseComponent } from '../../../shared/base/base.component';
import { ConceptoService } from './concepto.service';
import { Concepto } from './concepto.model';
import { Grupo } from '../grupo/grupo.model';
import { GrupoService } from '../grupo/grupo.service';
import { AlumnoService } from '../alumno/alumno.service';
import { Alumno } from '../alumno/alumno.model';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { TipoConcepto } from '../../../shared/base/tipo-concepto.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-producto',
  templateUrl: './concepto.component.html',
  styleUrls: ['./concepto.component.scss']
})
export class ConceptoComponent extends BaseComponent {
  modalFormVisible: boolean = false;
  conceptos: Concepto[] | null = null;
  concepto: Concepto | null = null;
  alumnos: Alumno[] | null = null;
  grupos: Grupo[] | null = null;
  tipos: any[] | null = null;
  conceptoForm!: FormGroup;
  searchForm!: FormGroup;
  deudaForm!: FormGroup;
  showFormSearch = false;
  showFormAlumno = false;
  totalAlumnos = 0;
  totalMontoDeuda = 0;
  public tipoConcepto = TipoConcepto;
  private deudaValueChangesSub!: Subscription;
  constructor(
    public _spinner: NgxSpinnerService, route: ActivatedRoute,
    private conceptoService: ConceptoService,
    private grupoService: GrupoService,
    private categoriaService: AlumnoService,
    private confDiService: ConfirmDialogService,
    private formBuilder: FormBuilder,
    private toastService: ToastService) {
    super(_spinner, route, confDiService);
  }

  ngOnInit(): void {
    this.handleNavigation();
    this.createSearchForm();
    this.createCompraForm();
    this.createDeudaForm();
    this.deudaValueChangesSub = this.deudas.valueChanges.subscribe(() => this.calcularTotalMontoDeuda());
  }

  ngOnDestroy(): void {
    if (this.deudaValueChangesSub) {
      this.deudaValueChangesSub.unsubscribe();
    }
  }

  private createCompraForm(): void {
    this.conceptoForm = this.formBuilder.group(
      {
        idConcepto: [''],
        idGrupo: ['', [Validators.required]],
        tipo: ['', [Validators.required]],
        concepto: ['', [Validators.maxLength(300)]],
        monto: [''],
        estado: ['', [Validators.required]],
      }
    );
  }

  private createDeudaForm(): void {
    this.deudaForm = this.formBuilder.group({
      deudas: this.formBuilder.array([])
    });
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        idGrupo: [''],
        concepto: [''],
        fechaDesde: [''],
        fechaHasta: [''],
        estado: [1],
      }
    );
  }
  
  private listTipoConcepto(): void {
    this.conceptoService.listTipoCombo().subscribe({
      next: (res: any) => {
        this.tipos = res;
      },
      error: e => {this.spinner.hide(); this.toastService.onError(e);}
    });
  }
  
  private listGrupo(): void {
    this.grupoService.listGrupoCombo().subscribe({
      next: (res: any) => {
        this.grupos = res;
      },
      error: e => {this.spinner.hide(); this.toastService.onError(e);}
    });
  }

  public toggleForm(): void {
    this.modalFormVisible = !this.modalFormVisible;
    if (this.modalFormVisible)
      this.loadCombos();
  }

  public handleModalChange(event: boolean) {
    this.modalFormVisible = event;
    if (!this.modalFormVisible) {
      this.conceptoForm.reset();
    }
  }

  public handleModalChangeAlum(event: boolean) {
    this.showFormAlumno = event;
  }

  override loadAll(): void {
    this.spinner.show();
    const searchForm = this.searchForm?.getRawValue();
    this.conceptoService
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
          this.conceptos = res.body?.data;
        },
        error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
      });
  }

  public onSubmit() {
    if (this.conceptoForm.status !== 'VALID') {
      this.toastService.addToast({ title: 'Error', color: 'warning', msg: 'Faltan datos para registrar' });
      return;
    }
    this.spinner.show();
    const cliente = this.conceptoForm.getRawValue();
    this.conceptoService.save(cliente).subscribe({
      next: () => this.onSaveSuccess(),
      error: e => {this.spinner.hide(); this.toastService.onError(e);}
    });
  }

  public searchSubmit() {
    this.loadAll()
  }

  private onSaveSuccess(): void {
    this.spinner.hide();
    this.toastService.addToast({ msg: 'Registrado con éxito.' });
    this.loadAll();
    this.onResetMarcaForm();
  }

  override deleting(row: any): void {
    this.conceptoService.delete(row.idConcepto).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastService.addToast({ msg: 'Eliminado con éxito' });
        this.loadAll();
      },
      error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
    });
  }

  public getData(prod: Concepto): void {
    if (!prod.idConcepto) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.spinner.show();
    this.conceptoService.find(prod.idConcepto + '').subscribe({
      next: (prod: Concepto) => {
        this.spinner.hide();
        this.modalFormVisible = !this.modalFormVisible;
        this.conceptoForm.patchValue(prod);
        this.loadCombos();
      },
      error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
    });
  }

  public deuda(concepto: Concepto): void {
    if (!concepto.idConcepto) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.concepto = concepto;
    if (concepto.fechaGenera) {
      this.confirmDialogService?.confirm('Confirmar', 'El concepto ya fue generado, ¿desea generar nuevamente?')
      .then((confirmed) => {
        if (!confirmed)
          return;
        this.listAlumnoDeuda(concepto.idConcepto ?? 0);
      });
    } else {
      this.listAlumnoDeuda(concepto.idConcepto);
    }
  }

  private initForm(): void {
    const deudasArray = this.deudaForm.get('deudas') as FormArray;
    deudasArray.clear()
    this.alumnos?.forEach(alumno => {
      const deudaForm = this.formBuilder.group({
        montoDeuda: [ (this.concepto?.monto || 0) / this.totalAlumnos],
        idAlumno: [alumno.idAlumno]
      });
      deudasArray.push(deudaForm);
    });
  }

  get deudas(): FormArray {
    return this.deudaForm.get('deudas') as FormArray;
  }

  private listAlumnoDeuda(idConcepto: number) {
    this.showFormAlumno = true;
    this.categoriaService.listAlumnoByConcepto(idConcepto).subscribe({
      next: (alumnos: any) => {
        this.alumnos = alumnos;
        this.totalAlumnos = alumnos.length;
        this.initForm();
      },
      error: e => {this.spinner.hide(); this.toastService.onError(e);}
    });
  }

  private loadCombos(): void {
    if (!this.grupos)
      this.listGrupo();
    if (!this.tipos)
      this.listTipoConcepto();
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

  public onResetMarcaForm() {
    this.conceptoForm.reset();
    this.toggleForm();
  }

  public toExcel(): void {
    this.spinner.show();
    this.conceptoService
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
          this.dataDownload(data, 'Reporte_producto.xlsx');
        },
        error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
      });
  }

  public generarDeuda(): void{
    this.confirmDialogService?.confirm('Confirmar', '¿Está seguro de generar deuda?')
      .then((confirmed) => {
        if (!confirmed)
          return;
        this.spinner.show();
        if (!this.concepto) {
          this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'Seleccione concepto' });
          return
        }
        this.concepto.deudas = this.deudaForm.getRawValue().deudas;
        this.conceptoService.generarDeuda(this.concepto).subscribe({
          next: () => {
            this.spinner.hide();
            this.toastService.addToast({ msg: 'Deuda generado con éxito' });
            this.showFormAlumno = false;
            this.loadAll();
          },
          error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
        });
      })
      .catch(() => console.log('cancelado...'));
  }

  private calcularTotalMontoDeuda(): void {
    this.totalMontoDeuda = this.deudas.controls.reduce((acc, deuda) => {
      return acc + deuda.get('montoDeuda')?.value || 0;
    }, 0);
  }
}
