import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { Pagination } from '../../core/request/request.model';
import { createRequestOption } from '../../core/request/request-util';
import { IPago } from './pago.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PagoService {
  public resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  save(data: FormData): Observable<IPago> {
    return this.http.post<IPago>(`${this.resourceUrl}/Pago/save`, data);
  }

  find(id: number): Observable<IPago> {
    return this.http.get<IPago>(`${this.resourceUrl}/Pago/getById/${id}`);
  }

  query(req?: Pagination): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<IPago[]>(`${this.resourceUrl}/Pago/listWithFilter`, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/Pago/delete/${id}`);
  }

  listActivoByCompra(id_compra: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.resourceUrl}/Pago/listActivoByCompra/${id_compra}`);
  }

  downloadExcel(req?: Pagination): Observable<any>  {
    const options = createRequestOption(req);
    return this.http.get(`${this.resourceUrl}/Pago/listWithFilter`, { params: options, responseType: 'arraybuffer'})
  }
  
  deleteArchivo(code_id_activo: string): Observable<any[]> {
    return this.http.delete<any[]>(`${this.resourceUrl}/Archivo/delete/${code_id_activo}`);
  }

  listActivoByCustodio(id_trabajador: number): Observable<IPago> {
    return this.http.get<IPago>(`${this.resourceUrl}/Pago/listActivoByCustodio/${id_trabajador}`);
  }

  getMonthByNumber(meses: number): Observable<any> {
    return this.http.get<any>(`${this.resourceUrl}/Pago/getMonthByNumber/${meses === 0 ? -1 : meses}`);
  }
  
}
