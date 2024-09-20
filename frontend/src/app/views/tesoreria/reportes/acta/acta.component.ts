import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../../shared/toast/toast.service';
import { ActaIngresoDto } from './dto/acta-ingreso.dto';
import { ActaAsignacion } from './dto/acta-asignacion.dto';
import { HojaVida } from './dto/hoja-vida.dto';
import { CambioEstadoDto } from './dto/cambio-estado.dto';
import { ActaService } from './acta.service';
import { UtilsModule } from '../../../../utils/utils.module';

@Component({
  selector: 'app-acta-ingreso-comprobante',
  templateUrl: './acta.component.html',
  styleUrls: ['./acta.component.scss']
})
export class ActaComponent {
  acta: ActaIngresoDto | null = null;
  actaAsig: ActaAsignacion | null = null;
  hojaVida: HojaVida | null = null;
  cambioEst: CambioEstadoDto | null = null;
  tipoActa = '';
  totalActivos = 0;
  totalValor = 0;
  constructor(
    private route: ActivatedRoute,
    private toastService: ToastService,
    protected spinner: NgxSpinnerService,
    private actaService: ActaService
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterContentInit() {
    this.getParamId();
  }

  private getParamId(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.tipoActa = params.get('acta') ?? '';
      const tipos = ['ingreso', 'asignacion', 'cambioEstado', 'hojaVida'];
      if (!UtilsModule.isNumeric(id!)) {
        this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'El ID no es numérico' });
        return;
      }
      if (!tipos.includes(this.tipoActa)) {
        this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'Tipo de acta no existe' });
        return;
      }
      switch (this.tipoActa) {
        case 'ingreso':
          this.getActaIngreso(parseInt(id!, 10));
          break;
        case 'asignacion':
          this.getActaAsignacion(parseInt(id!, 10));
          break;
        case 'cambioEstado':
          this.getCambioEstado(parseInt(id!, 10));
          break;
        case 'hojaVida':
          this.getHojaVida(parseInt(id!, 10));
          break;
      }
    });
  }
  public getHojaVida(id_activo: number | null): void {
    if (!id_activo) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.spinner.show();
    this.actaService.getHojaVida(id_activo).subscribe({
      next: (hoja: HojaVida) => {
        this.spinner.hide();
        this.hojaVida = hoja;
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e) }
    });
  }

  public getCambioEstado(id_cambio_estado: number | null): void {
    if (!id_cambio_estado) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.spinner.show();
    this.actaService.getCambioEstado(id_cambio_estado).subscribe({
      next: (acta: CambioEstadoDto) => {
        this.spinner.hide();
        this.cambioEst = acta;
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e) }
    });
  }

  public getActaAsignacion(id_asignacion: number | null): void {
    if (!id_asignacion) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.spinner.show();
    this.actaService.getActaAsignacion(id_asignacion).subscribe({
      next: (acta: ActaAsignacion) => {
        this.spinner.hide();
        this.actaAsig = acta;
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e) }
    });
  }

  public getActaIngreso(id_compra: number | null): void {
    if (!id_compra) {
      this.toastService.addToast({ title: 'Alerta', color: 'warning', msg: 'No existe datos para consultar' });
      return;
    }
    this.spinner.show();
    this.actaService.getActaIngreso(id_compra).subscribe({
      next: (acta: ActaIngresoDto) => {
        this.spinner.hide();
        this.acta = acta;
        this.totalActivos = acta.activos.length;
        this.totalValor = acta.activos.reduce((total, dato) => total + dato.valorCompra, 0);
      },
      error: (e) => { this.spinner.hide(); this.toastService.onError(e) }
    });
  }

  public print(): void {
    const printContents = document.getElementById('printableContent')?.innerHTML;
    const pw = window.open('', '_blank');
    if (pw) {

      const style = pw.document.createElement('style');
      style.innerHTML = `
      body {
        font-family: "Segoe UI", sans-serif;
        font-size: 12px;
      }
      .table {
        font-size: 12px;
      }
      .print-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        text-align: left;
      }

      .print-table th,
      .print-table td {
        padding: 3px 3px;
        border: 1px solid #ddd;
      }
      .align-right {
        text-align: right;
      }
      `;
      pw.document.open();
      pw.document.write(printContents ?? '');
      pw.document.head.appendChild(style);
      pw.document.close();
      pw.onload = () => {
        pw.print();
        pw.onafterprint = () => {
          pw.close();
        };
      };
    } else {
      this.toastService.onError('La ventana emergente de impresión fue bloqueada por el navegador.');
    }
  }
}
