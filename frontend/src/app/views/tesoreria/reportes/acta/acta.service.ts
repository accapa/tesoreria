import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../../core/config/application-config.service';
import { IActaIngresoDto } from './dto/acta-ingreso.dto';
import { environment } from '../../../../../environments/environment';
import { IActaAsignacion } from './dto/acta-asignacion.dto';
import { IHojaVida } from './dto/hoja-vida.dto';
import { ICambioEstadoDto } from './dto/cambio-estado.dto';

@Injectable({ providedIn: 'root' })
export class ActaService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  getActaIngreso(id_compra: number): Observable<IActaIngresoDto> {
    return this.http.get<IActaIngresoDto>(`${this.resourceUrl}/activosFijos/Compra/getActaIngreso/${id_compra}`);
  }

  getActaAsignacion(id_asignacion: number): Observable<IActaAsignacion> {
    return this.http.get<IActaAsignacion>(`${this.resourceUrl}/activosFijos/Asignacion/getActaAsignacion/${id_asignacion}`);
  }

  getCambioEstado(id_cambio_estado: number): Observable<ICambioEstadoDto> {
    return this.http.get<ICambioEstadoDto>(`${this.resourceUrl}/activosFijos/CambioEstado/getActaCambioEstado/${id_cambio_estado}`);
  }

  getHojaVida(id_activo: number): Observable<IHojaVida> {
    return this.http.get<IHojaVida>(`${this.resourceUrl}/activosFijos/Activo/getHojaVida/${id_activo}`);
  }
}
