import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/shared/base/base.component';
import { ConfirmDialogService } from 'src/app/shared/confirm/confirm.app.service';
import { ToastService } from 'src/app/shared/toast/toast.service';
import { EstadoFinancieroService } from './estado-financiero.service';
import { AlumnoService } from '../../admin/alumno/alumno.service';
import { EstadoFinancieroDto } from './dto/estado-financiero.dto';
import { Grupo } from '../../admin/grupo/grupo.model';
import { GrupoService } from '../../admin/grupo/grupo.service';
import { Alumno } from '../../admin/alumno/alumno.model'; 

@Component({
  selector: 'app-reporte-consumo',
  templateUrl: './estado-financiero.component.html',
  styleUrls: ['./estado-financiero.component.scss']
})
export class EstadoFinancieroComponent extends BaseComponent implements OnInit {
  searchForm!: FormGroup;
  grupos: Grupo[] | null = null;
  alumnos: Alumno[] | null = null;
  periodos: any[] | null = null;
  estados: EstadoFinancieroDto[] | null = null;
  totalDebito: number = 0;
  totalCredito: number = 0;
  saldoFinal: number = 0;
  constructor(
    public _spinner: NgxSpinnerService, route: ActivatedRoute, private confDiService: ConfirmDialogService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private consumoService: EstadoFinancieroService,
    private grupoService: GrupoService,
    private alumnoService: AlumnoService
  ) {
    super(_spinner, route, confDiService);
  }

  ngOnInit(): void {
    this.createSearchForm();
    this.initFormSearch();
    this.listGrupo();
  }

  public onResetSearchForm(): void {
    this.searchForm.reset();
    this.initFormSearch();
  }

  public searchSubmit() {
    const searchForm = this.searchForm?.getRawValue();
    this.consumoService.estado(searchForm).subscribe({
        next: (list: EstadoFinancieroDto[]) => {
          this.spinner.hide();
          this.totalDebito = 0;
          this.totalCredito = 0;
          this.estados = list;
          for (const item of list) {
            this.totalDebito += item.debito || 0;
            this.totalCredito += item.credito || 0;
          }
          this.saldoFinal = this.totalDebito - this.totalCredito;
        },
        error: (e) => {
          this.spinner.hide();
          this.toastService.onError(e);
        }
      });
  }
 
  public toExcel(): void {
    this.spinner.show();
    this.consumoService
      .downloadExcel({
        ...{
          sort: [`${this.predicate},${this.ascending ? 'asc' : 'desc'}`],
          isToExcel: true,
        }, ...this.searchForm?.getRawValue()
      })
      .subscribe({
        next: (data: any) => {
          this.spinner.hide();
          this.dataDownload(data, 'Reporte_consumo.xlsx');
        },
        error: (e) => { this.spinner.hide(); this.toastService.onError(e); },
      });
  }

  public onGrupoChange(e: any): void {
    this.searchForm.patchValue({ idAlumno: null });
    const idGrupo = this.searchForm.get('idGrupo')?.getRawValue();
    if (!idGrupo)
      return;
    this.listAlumno(idGrupo);
  }

  public onAlumnoChange(e: any): void {
    this.searchForm.patchValue({ idPeriodo: null });
    const idAlumno = this.searchForm.get('idAlumno')?.getRawValue();
    if (!idAlumno)
      return;
    this.listPeriodo(idAlumno);
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        idGrupo: [null],
        idAlumno: [null],
        idPeriodo: [null],
        fechaDesde: [null],
        fechaHasta: [null]
      }
    );
  }

  private initFormSearch(): void {
    this.consumoService.initForm().subscribe({
      next: (compra: any) => {
        this.searchForm.patchValue(compra);
      },
      error: (e) => { this.toastService.onError(e); },
    });
  }

  private listGrupo(): void {
    this.grupoService.listGrupoCombo().subscribe({
      next: (compra: any) => {
        this.grupos = compra;
        if (this.grupos && this.grupos.length > 0) {
          const idGrupo =  this.grupos[0].idGrupo;
          this.searchForm.patchValue({ idGrupo: idGrupo });
          this.listAlumno(idGrupo ?? 0);
        }
      },
      error: (e) => this.toastService.onError(e)
    });
  }

  private listAlumno(idGrupo: number): void {
    this.alumnoService.listAlumnoByGrupo(idGrupo).subscribe({
      next: (_alumnos: any) => {
        this.alumnos = _alumnos;
        if (this.alumnos && this.alumnos.length > 0) {
          const idAlumno = this.alumnos[0].idAlumno;
          this.searchForm.patchValue({ idAlumno: idAlumno });
          this.listPeriodo(idAlumno ?? 0);
        }
      },
      error: (e) => this.toastService.onError(e)
    });
  }

  private listPeriodo(idAlumno: number): void {
    this.consumoService.listPeriodoByAlumno(idAlumno).subscribe({
      next: (rows: any) => {
        this.periodos = rows;
        if (this.periodos && this.periodos.length > 0) {
          this.searchForm.patchValue({ idPeriodo: this.periodos[0].id });
          this.searchSubmit();
        }
      },
      error: (e) => this.toastService.onError(e)
    });
  }
}
