import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';

import { BaseComponent } from 'src/app/shared/base/base.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { Grupo } from '../admin/grupo/grupo.model';
import { ToastService } from 'src/app/shared/toast/toast.service';

interface IUser {
  name: string;
  state: string;
  registered: string;
  country: string;
  usage: number;
  period: string;
  payment: string;
  activity: string;
  avatar: string;
  status: string;
  color: string;
}

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent extends BaseComponent implements OnInit {
  public chartBarData = {
    labels: [...['Sin enviar']],
    datasets: [
      {
        label: 'Ingresos',
        backgroundColor: '#f87979',
        data: [0]
      }
    ]
  };
  searchForm!: FormGroup;
  clienteForm!: FormGroup;
  public weekNow = '';
  sucursales: Grupo[] | null = null;
  public totalIngresos = 0;
  public clientes: any[] = [];
  public clientesNuevos = 0;
  public clientesConcure = 0;
  public clientesMuj = 0;
  public clientesVar = 0;
  public clientesTotalSexo: {varones: 0, mujeres: 0} = {varones: 0, mujeres: 0}; //todo: poner a un interface

  constructor(
    public _spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private chartsData: DashboardChartsData,
    private formBuilder: FormBuilder,
    private toastService: ToastService
  ) {
    super(_spinner, route, null);
  }

  public mainChart: IChartProps = {};
  public chart: Array<IChartProps> = [];
  public trafficRadioGroup = new UntypedFormGroup({
    trafficRadio: new UntypedFormControl('Month')
  });

  ngOnInit(): void {
    this.initCharts();
    this.listSucursal();
    this.getWeekNow();
    this.createSearchForm();
    this.getTotalSexo();
    this.initClienteForm();
  }

  initCharts(): void {
    this.mainChart = this.chartsData.mainChart;
  }

  private createSearchForm(): void {
    this.searchForm = this.formBuilder.group(
      {
        idGrupo: ['1', [Validators.required]], //1: cañete, todo: poner esto en una constante
        fecha: [this.weekNow, [Validators.required]],
      }
    );

    setTimeout(() => {
      this.searchForm.patchValue({ fecha: this.weekNow });
      this.searchSubmit();
    }, 800);

    this.clienteForm = this.formBuilder.group(
      {
        idGrupo: [''],
        fechaDesde: [''],
        fechaHasta: [''],
      }
    );
  }

  private getWeekNow() {
  }

  private listSucursal(): void {
  }

  setTrafficPeriod(value: string): void {
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.chartsData.initMainChart(value);
    this.initCharts();
  }

  searchSubmit(): void {
   
  }

  clienteSubmit(): void {
   
  }
  
  private getTotalSexo(): void {
  }

  private initClienteForm() {
  }

}
