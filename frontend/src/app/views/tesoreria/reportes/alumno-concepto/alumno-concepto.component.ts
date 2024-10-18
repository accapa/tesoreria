import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../../shared/base/base.component';
import { ConfirmDialogService } from '../../../../shared/confirm/confirm.app.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { AlumnoConceptoService } from './alumno-concepto.service';
import { GrupoService } from 'src/app/views/admin/grupo/grupo.service';
import { Grupo } from 'src/app/views/admin/grupo/grupo.model';
import { EstadoDeuda } from 'src/app/shared/base/estado-deuda.enum';

@Component({
  selector: 'app-alumno-concepto',
  templateUrl: './alumno-concepto.component.html',
  styleUrls: ['./alumno-concepto.component.scss']
})
export class AlumnoConceptoComponent extends BaseComponent {
  alumnoCat: any[] | null = null;
  estados: any[] | null = null;
  grupos: Grupo[] | null = null;
  searchForm!: FormGroup;
  heads = [];
  constructor(
    private confDiService: ConfirmDialogService, route: ActivatedRoute, private router: Router,
    private formBuilder: FormBuilder, private toastService: ToastService,
    public _spinner: NgxSpinnerService,
    private grupoService: GrupoService,
    private alumnoConptoService: AlumnoConceptoService,

  ) {
    super(_spinner, route, confDiService);
  }

  ngOnInit(): void {
    this.createSearchForm();
    this.listGrupo();
    this.listEstado();
  }

  private listGrupo(): void {
    this.grupoService.listGrupoCombo().subscribe({
      next: (res: any) => {
        this.grupos = res;
      },
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  private listEstado(): void {
    this.alumnoConptoService.listEstado().subscribe({
      next: (res: any) => {
        this.estados = res;
      },
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        idGrupo: [null],
        estados: new FormControl([])
      }
    );
  }

  public onResetSearchForm() {
    this.searchForm.reset();
  }

  public searchSubmit(): void {
    this.onSubmit();
  }

  public onSubmit(): void {
    this.spinner.show();
    this.alumnoConptoService.alumnoConcepto(this.searchForm?.getRawValue())
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.alumnoCat = res.data;
          this.heads = res.head;
        },
        error: (e) => { 
          this.spinner.hide(); 
          this.toastService.onError(e); 
          this.alumnoCat = [];
          this.heads = [];
        },
      });
  }

  public onCategoriaChange(e: any): void {
    if (e?.idGrupo) {
      this.onSubmit();
    }
  }

  getColumnas() {
    const columnas: string[] = [];
    if (this.alumnoCat && this.alumnoCat.length > 0) {
      const keys = Object.keys(this.alumnoCat[0]);
      keys.forEach(key => {
        const match = key.match(/_(\d+)$/);
        if (match && !columnas.includes(match[1])) {
          columnas.push(match[1]);
        }
      });
    }
    return columnas;
  }

  getPagado() {
    return EstadoDeuda.Pagado;
  }

  getPorcentage(monto: number, montoRestante: number) {
    return ( (monto - montoRestante) * 100) / monto;
  }

  public ngSelectGetDataFromOption(itemOption: any) {
    return itemOption.label
  }
}
