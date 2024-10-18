import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../../shared/base/base.component';
import { ConfirmDialogService } from '../../../../shared/confirm/confirm.app.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { BalanceGrupoService } from './balance-grupo.service';
import { GrupoService } from '../../../admin/grupo/grupo.service';
import { Grupo } from '../../../admin/grupo/grupo.model';
import { BalanceGrupoDto } from './balance-grupo.dto';

@Component({
  selector: 'app-balance-grupo',
  templateUrl: './balance-grupo.component.html',
  styleUrls: ['./balance-grupo.component.scss']
})
export class BalanceGrupoComponent extends BaseComponent {
  balances: BalanceGrupoDto[] | null = null;
  total = 0;
  grupos: Grupo[] | null = null;
  searchForm!: FormGroup;
  constructor(
    private confDiService: ConfirmDialogService, route: ActivatedRoute, private router: Router,
    private formBuilder: FormBuilder, private toastService: ToastService,
    public _spinner: NgxSpinnerService,
    private grupoService: GrupoService,
    private alumnoConptoService: BalanceGrupoService,

  ) {
    super(_spinner, route, confDiService);
  }

  ngOnInit(): void {
    this.createSearchForm();
    this.listGrupo();
  }

  private listGrupo(): void {
    this.grupoService.listGrupoCombo().subscribe({
      next: (res: any) => {
        this.grupos = res;
      },
      error: e => { this.spinner.hide(); this.toastService.onError(e); }
    });
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        idGrupo: [null]
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
    this.alumnoConptoService.balanceGrupo(this.searchForm?.getRawValue())
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.balances = res;
          const conceptoTotal = this.balances?.reduce((total, dato) => total + dato.total, 0) || 0;
          const montoSum = this.balances?.reduce((accumulator, item) => {
            const egresoTotal = item.egresos.reduce((sum, egreso) => sum + egreso.monto * -1, 0);
            return accumulator + egresoTotal;
          }, 0);
          this.total = conceptoTotal + (montoSum || 0)
        },
        error: (e) => {
          this.spinner.hide();
          this.toastService.onError(e);
          this.balances = [];
        },
      });
  }

  public onCategoriaChange(e: any): void {
    if (e?.idGrupo) {
      this.onSubmit();
    }
  }

  public ngSelectGetDataFromOption(itemOption: any) {
    return itemOption.label
  }
}
