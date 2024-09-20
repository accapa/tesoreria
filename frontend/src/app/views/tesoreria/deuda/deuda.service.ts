import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { Pagination } from '../../core/request/request.model';
import { createRequestOption } from '../../core/request/request-util';
import { environment } from '../../../../environments/environment';
import { IDeuda } from './deuda.model';

@Injectable({ providedIn: 'root' })
export class DeudaService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  save(compra: IDeuda): Observable<IDeuda> {
    return this.http.post<IDeuda>(`${this.resourceUrl}/activosFijos/Compra/save`, compra);
  }

  find(id: number): Observable<IDeuda> {
    return this.http.get<IDeuda>(`${this.resourceUrl}/Deuda/getById/${id}`);
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/activosFijos/Compra/delete/${id}`);
  }

  listTipoComprobanteCombo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.resourceUrl}/activosFijos/Compra/listTipoComprobanteCombo`);
  }

  downloadExcel(req?: Pagination): Observable<any>  {
    const options = createRequestOption(req);
    return this.http.get(`${this.resourceUrl}/activosFijos/Compra/listWithFilter`, { params: options, responseType: 'arraybuffer'})
  }

  listDeudaByIdAlumno(idAlumno: number): Observable<IDeuda[]> {
    return this.http.get<IDeuda[]>(`${this.resourceUrl}/Deuda/listDeudaByIdAlumno/${idAlumno}`);
  }
}
