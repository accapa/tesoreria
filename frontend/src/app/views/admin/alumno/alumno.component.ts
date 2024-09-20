import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogService } from 'src/app/shared/confirm/confirm.app.service';
import { BaseComponent } from '../../../shared/base/base.component';
import { AlumnoService } from './alumno.service';
import { Alumno } from './alumno.model';
import { Grupo } from '../../admin/grupo/grupo.model';
import { GrupoService } from '../../admin/grupo/grupo.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { PersonaService } from 'src/app/shared/base/persona/persona.service';
import { Persona } from 'src/app/shared/base/persona/persona.model';

@Component({
  selector: 'app-categoria-producto',
  templateUrl: './alumno.component.html',
  styleUrls: ['./alumno.component.scss']
})
export class AlumnoComponent extends BaseComponent {
  modalFormVisible: boolean = false;
  alumnos: Alumno[] | null = null;
  grupos: Grupo[] | null = null;
  prodCatForm!: FormGroup;
  searchForm!: FormGroup;
  showFormSearch = false;
  showFormTarjeta = false;
  isLoading = false;
  constructor(
    public _spinner: NgxSpinnerService,
    private categoriaService: AlumnoService,
    private grupoService: GrupoService,
    private confDiService: ConfirmDialogService, route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private personaService: PersonaService
  ) {
    super(_spinner, route, confDiService);
  }

  ngOnInit(): void {
    this.handleNavigation();
    this.createSearchForm();
    this.createCompraForm();
  }

  ngOnDestroy(): void {
  }

  private createCompraForm(): void {
    this.prodCatForm = this.formBuilder.group(
      {
        idAlumno: [''],
        idGrupo: ['', [Validators.required]],
        dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern(/^[0-9]*$/)]],
        nombres: ['', [Validators.required]],
        apellidos: ['', [Validators.required]],
        estado: ['', [Validators.required]],
      }
    );
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        idGrupo: [''],
        dni: [''],
        nombres: [''],
        fechaDesde: [''],
        fechaHasta: [''],
        estado: [1],
      }
    );
  }

  private listSucursal(): void {
    this.grupoService.listGrupoCombo().subscribe({
      next: (res: any) => {
        this.grupos = res;
      },
      error: e => {this.spinner.hide(); this.toastService.onError(e);}
    });
  }

  //Abre ventana para registrar cliente
  public toggleForm(): void {
    this.modalFormVisible = !this.modalFormVisible;
    if (this.modalFormVisible)
      this.loadCombos();
  }

  public handleModalChange(event: boolean) {
    this.modalFormVisible = event;
    if (!this.modalFormVisible) {
      this.prodCatForm.reset();
    }
  }

  override loadAll(): void {
    this.spinner.show();
    const searchForm = this.searchForm?.getRawValue();
    this.categoriaService
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
          this.alumnos = res.body?.data;
        },
        error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
      });
  }

  public onSubmit() {
    if (this.prodCatForm.status !== 'VALID') {
      this.toastService.addToast({ title: 'Error', color: 'warning', msg: 'Faltan datos para registrar' });
      return;
    }
    this.spinner.show();
    const cliente = this.prodCatForm.getRawValue();
    this.categoriaService.save(cliente).subscribe({
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
    this.onResetMarcaForm(); //Cierra y resetea el formulario
  }

  override deleting(row: any): void {
    this.categoriaService.delete(row.idAlumno).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastService.addToast({ msg: 'Eliminado con éxito' });
        this.loadAll();
      },
      error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
    });
  }

  public getData(compra: Alumno): void {
    if (!compra.idAlumno) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.spinner.show();
    this.categoriaService.find(compra.idAlumno + '').subscribe({
      next: (compra: Alumno) => {
        this.loadCombos();
        this.spinner.hide();
        this.modalFormVisible = !this.modalFormVisible;
        this.prodCatForm.patchValue(compra);
      },
      error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
    });
  }

  private loadCombos(): void {
    if (!this.grupos)
      this.listSucursal();
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
    this.prodCatForm.reset();
    this.toggleForm();
  }

  public toExcel(): void {
    this.spinner.show();
    this.categoriaService
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
          this.dataDownload(data, 'Reporte_categoria_producto.xlsx');
        },
        error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
      });
  }

  public searchDniInApi() : void{
    const dniControl = this.prodCatForm.get('dni');
    if (!dniControl?.valid){
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'Ingrese DNI válido' });
      return;
    }
    this.isLoading = true;
    this.personaService.getPersonaFromApi(dniControl.value).subscribe({
      next: (persona: Persona) => {
        this.isLoading = false;
        this.prodCatForm.patchValue({
          nombres: persona.nombres,
          apellidos: persona.apellidoPaterno + ' ' + persona.apellidoMaterno,
        });
      },
      error: e => {
        this.isLoading = false;
        {this.spinner.hide(); this.toastService.onError(e);}
      }
    });
  }
}
