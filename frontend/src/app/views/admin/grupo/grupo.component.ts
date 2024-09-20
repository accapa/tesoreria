import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogService } from 'src/app/shared/confirm/confirm.app.service';
import { BaseComponent } from '../../../shared/base/base.component';
import { GrupoService } from './grupo.service';
import { Grupo } from './grupo.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

@Component({
  templateUrl: 'grupo.component.html',
})
export class GrupoComponent extends BaseComponent{
  modalFormVisible: boolean = false;
  marcas: Grupo[] | null = null;
  grupoForm!: FormGroup;
  searchForm!: FormGroup;
  showFormSearch = false;
  showFormTarjeta = false;
  constructor(
    public _spinner: NgxSpinnerService,
    private sucursalService: GrupoService,
    private confDiService: ConfirmDialogService, route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private toastService: ToastService) {
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
    this.grupoForm = this.formBuilder.group(
      {
        idGrupo: [''],
        descripcion: ['', [Validators.maxLength(200)]],
        estado: ['', [Validators.required]],
      }
    );
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        descripcion: [''],
        estado: [''],
      }
    );
  }

  //Abre ventana para registrar cliente
  public toggleForm(): void {
    this.modalFormVisible = !this.modalFormVisible;
  }

  public handleModalChange(event: boolean) {
    this.modalFormVisible = event;
    if (!this.modalFormVisible) {
      this.grupoForm.reset();
    }
  }

  override loadAll(): void {
    this.spinner.show();
    const searchForm = this.searchForm?.getRawValue();
    this.sucursalService
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
          this.marcas = res.body?.data;
        },
        error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
      });
  }

  public onSubmit() {
    if (this.grupoForm.status !== 'VALID') {
      this.toastService.addToast({ title: 'Error', color: 'warning', msg: 'Faltan datos para registrar' });
      return;
    }
    this.spinner.show();
    const cliente = this.grupoForm.getRawValue();
    this.sucursalService.save(cliente).subscribe({
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
    this.sucursalService.delete(row.idGrupo).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastService.addToast({ msg: 'Eliminado con éxito' });
        this.loadAll();
      },
      error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
    });
  }

  public getData(compra: Grupo): void {
    if (!compra.idGrupo) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.spinner.show();
    this.sucursalService.find(compra.idGrupo + '').subscribe({
      next: (compra: Grupo) => {
        //this.loadCombos();
        this.spinner.hide();
        this.modalFormVisible = !this.modalFormVisible;
        this.grupoForm.setValue(compra);
      },
      error: (e) => {this.spinner.hide(); this.toastService.onError(e);},
    });
  }

  public toggleSearchForm(): void {
    this.showFormSearch = !this.showFormSearch;
  }

  public onResetSearchForm() {
    this.searchForm.reset();
    this.handleNavigation();
  }

  public onResetMarcaForm() {
    this.grupoForm.reset();
    this.toggleForm();
  }
}
