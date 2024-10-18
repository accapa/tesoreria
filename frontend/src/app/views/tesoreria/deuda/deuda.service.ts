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

  save(deuda: IDeuda): Observable<IDeuda> {
    return this.http.post<IDeuda>(`${this.resourceUrl}/Deuda/save`, deuda);
  }

  find(id: number): Observable<IDeuda> {
    return this.http.get<IDeuda>(`${this.resourceUrl}/Deuda/getById/${id}`);
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/Deuda/delete/${id}`);
  }
  
  downloadExcel(req?: Pagination): Observable<any>  {
    const options = createRequestOption(req);
    return this.http.get(`${this.resourceUrl}/Deuda/listWithFilter`, { params: options, responseType: 'arraybuffer'})
  }

  listDeudaByIdAlumno(idAlumno: number): Observable<IDeuda[]> {
    return this.http.get<IDeuda[]>(`${this.resourceUrl}/Deuda/listDeudaByIdAlumno/${idAlumno}`);
  }

  listEstadoDeuda(): Observable<any[]> {
    return this.http.get<any[]>(`${this.resourceUrl}/Deuda/listEstadoDeuda`);
  }
}
