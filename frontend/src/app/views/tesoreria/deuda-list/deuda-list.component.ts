import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogService } from 'src/app/shared/confirm/confirm.app.service';
import { BaseComponent } from '../../../shared/base/base.component';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { Alumno } from '../../admin/alumno/alumno.model';
import { AlumnoService } from '../../admin/alumno/alumno.service';
import { Grupo } from '../../admin/grupo/grupo.model';
import { GrupoService } from '../../admin/grupo/grupo.service';

@Component({
  selector: 'app-compra-list-component',
  templateUrl: './deuda-list.component.html',
  styleUrls: ['./deuda-list.component.scss']
})
export class DeudaListComponent extends BaseComponent {
  alumnos: Alumno[] | null = null;
  grupos: Grupo[] | null = null;
  searchForm!: FormGroup;
  showFormTarjeta = false;
  constructor(
    public _spinner: NgxSpinnerService,
    private alumnoService: AlumnoService,
    private confDiService: ConfirmDialogService, route: ActivatedRoute, private router: Router,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private grupoService: GrupoService
  ) {
    super(_spinner, route, confDiService);
  }

  ngOnInit(): void {
    this.handleNavigation();
    this.createSearchForm();
    this.listGrupo();
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        idGrupo: [null],
        dni: [null],
        nombres: [null],
      }
    );
  }

  private listGrupo(): void {
    this.grupoService.listGrupoCombo().subscribe({
      next: (res: any) => {
        this.grupos = res;
      },
      error: e => {this.spinner.hide(); this.toastService.onError(e);}
    });
  }

  override loadAll(): void {
    this.spinner.show();
    const searchForm = this.searchForm?.getRawValue();
    this.alumnoService
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

  public searchSubmit() {
    this.loadAll()
  }

  public getData(compra: Alumno): void {
    if (!compra.idAlumno) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.router.navigate([`/tesoreria/deuda/${compra.idAlumno}`]);
  }

  public onResetSearchForm() {
    this.searchForm.reset();
    this.handleNavigation();
  }
}
