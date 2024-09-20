import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { Pagination } from '../../core/request/request.model';
import { createRequestOption } from '../../core/request/request-util';
import { IEgreso } from './egreso.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EgresoService {
  private resourceUrl = this.applicationConfigService.getEndpointFor(environment.apiBaseUrl);
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) { }

  save(data: FormData): Observable<IEgreso> {
    return this.http.post<IEgreso>(`${this.resourceUrl}/Egreso/save`, data);
  }

  find(id: number): Observable<IEgreso> {
    return this.http.get<IEgreso>(`${this.resourceUrl}/Egreso/getById/${id}`);
  }

  query(req?: Pagination): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<IEgreso[]>(`${this.resourceUrl}/Egreso/listWithFilter`, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/Egreso/delete/${id}`);
  }

  deleteAsignacionDet(id_asignaciondet: number): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/Egreso/deleteAsignacionDet/${id_asignaciondet}`);
  }

  downloadExcel(req?: Pagination): Observable<any>  {
    const options = createRequestOption(req);
    return this.http.get(`${this.resourceUrl}/Egreso/listWithFilter`, { params: options, responseType: 'arraybuffer'})
  }


  initAsignacionDet(id_asignacion: number): Observable<any> {
    return this.http.get<any>(`${this.resourceUrl}/Egreso/initAsignacionDet/${id_asignacion}`);
  }
  
}
